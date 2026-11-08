import {
    avatar, BadRequestError, ContestModel, ContestNotEndedError, Context, PERM,
    STATUS, STATUS_SHORT_TEXTS, UserModel,
} from 'hydrooj';

export const name = 'hydrooj-resolver';
export function apply(ctx: Context) {
    ctx.inject(['scoreboard'], ({ scoreboard }) => {
        scoreboard.addView('resolver', '滚榜', { tdoc: 'tdoc' }, {
            checker() {
                return this.tdoc.rule === 'acm' && ContestModel.isDone(this.tdoc) && !!this.tdoc.lockAt
                    && (this.user.own(this.tdoc) || this.user.hasPerm(PERM.PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD));
            },
            async display({ tdoc }) {
                if (!this.user.own(tdoc)) this.checkPerm(PERM.PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD);
                if (tdoc.rule !== 'acm') throw new BadRequestError('本地滚榜目前仅支持 ACM 比赛');
                if (!ContestModel.isDone(tdoc)) throw new ContestNotEndedError();
                if (!tdoc.lockAt) throw new BadRequestError('此比赛未设置封榜时间');
                const teams = await ContestModel.getMultiStatus(tdoc.domainId, { docId: tdoc.docId }).toArray();
                const users = await UserModel.getList(tdoc.domainId, teams.map(t => t.uid));
                const start = new Date(tdoc.beginAt).getTime();
                const end = new Date(tdoc.endAt).getTime();
                const freeze = new Date(tdoc.lockAt).getTime();
                if (!(start < end && start <= freeze && freeze <= end)) throw new BadRequestError('比赛或封榜时间不正确');
                const submissions = new Map();
                for (const team of teams) {
                    for (const record of team.journal || []) {
                        if (!tdoc.pids.includes(record.pid)) continue;
                        const timestamp = record.rid.getTimestamp().getTime();
                        if (timestamp < start || timestamp > end) continue;
                        submissions.set(`${team.uid}:${record.rid}`, {
                            id: String(record.rid), team: String(team.uid), problem: String(record.pid),
                            verdict: STATUS_SHORT_TEXTS[record.status] || String(record.status),
                            penalty: ![STATUS.STATUS_ACCEPTED, STATUS.STATUS_COMPILE_ERROR,
                                STATUS.STATUS_FORMAT_ERROR, STATUS.STATUS_CANCELED].includes(record.status),
                            time: (timestamp - start) / 1000,
                        });
                    }
                }
                const label = (n: number): string => n < 26 ? String.fromCharCode(65 + n) : label(Math.floor(n / 26) - 1) + label(n % 26);
                this.response.body = {
                    payload: {
                        name: tdoc.title, contestId: String(tdoc.docId), duration: (end - start) / 1000,
                        frozen: (freeze - start) / 1000, penaltyMinutes: 20,
                        problems: tdoc.pids.map((pid, index) => ({ id: String(pid), name: label(index) })),
                        teams: teams.map(t => ({
                            id: String(t.uid), name: users[t.uid]?.displayName || users[t.uid]?.uname || String(t.uid),
                            avatar: users[t.uid] ? avatar(users[t.uid].avatar) : '',
                            institution: users[t.uid]?.school?.trim() || '西安理工大学', exclude: !!t.unrank,
                        })),
                        submissions: [...submissions.values()],
                    },
                    tdoc,
                };
                this.response.template = 'resolver.html';
            },
            supportedRules: ['acm'],
        });
    });
}
