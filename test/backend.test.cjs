const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const esbuild=require('esbuild');
const compiled=esbuild.transformSync(fs.readFileSync(path.join(__dirname,'../index.ts'),'utf8'),{loader:'ts',format:'cjs'}).code;
function setup() {
  let view;
  const tdoc={docId:'contest',domainId:'system',title:'测试',rule:'acm',pids:[100],beginAt:new Date(0),lockAt:new Date(300000),endAt:new Date(7200000)};
  const rid={getTimestamp:()=>new Date(400000),toString:()=> 'rid'};
  const module={exports:{}};
  const hydro={avatar:()=>'/avatar.png',BadRequestError:Error,ContestNotEndedError:Error,
    ContestModel:{isDone:t=>t.endAt<Date.now(),getMultiStatus:()=>({toArray:async()=>[{uid:7,journal:[{pid:100,rid,status:1}]}]})},
    PERM:{PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD:42},STATUS:{STATUS_ACCEPTED:1,STATUS_COMPILE_ERROR:2,STATUS_FORMAT_ERROR:3,STATUS_CANCELED:4},
    STATUS_SHORT_TEXTS:{1:'AC'},UserModel:{getList:async()=>({7:{uname:'队伍',seat:'A01'}})}};
  vm.runInNewContext(compiled,{module,exports:module.exports,require:name=>{assert.equal(name,'hydrooj');return hydro},Map,Date,String});
  module.exports.apply({inject:(services,callback)=>callback({scoreboard:{addView:(id,name,args,options)=>{view={id,name,args,...options}}}})});
  return {view,tdoc,handler:{user:{own:()=>true,hasPerm:()=>true},checkPerm(){throw new Error('permission denied')},response:{}}};
}
test('注册 resolver 滚榜视图',()=>{const {view}=setup();assert.equal(view.id,'resolver');assert.equal(view.name,'滚榜')});
test('队伍和提交都使用 uid，而不是混用 seat 导致无法滚榜',async()=>{
  const {view,tdoc,handler}=setup();await view.display.call(handler,{tdoc});
  assert.equal(handler.response.body.payload.teams[0].id,'7');
  assert.equal(handler.response.body.payload.submissions[0].team,'7');
  assert.equal(handler.response.template,'resolver.html');
});
test('禁止无权限用户读取封榜后的完整数据',async()=>{
  const {view,tdoc,handler}=setup();handler.user={own:()=>false,hasPerm:()=>false};handler.tdoc=tdoc;
  assert.equal(view.checker.call(handler),false);await assert.rejects(view.display.call(handler,{tdoc}),/permission denied/);
});
test('直接访问也必须满足已结束、ACM、已封榜条件',async()=>{
  for(const values of [{rule:'oi'},{lockAt:null},{endAt:new Date(Date.now()+86400000)}]){
    const {view,tdoc,handler}=setup();Object.assign(tdoc,values);await assert.rejects(view.display.call(handler,{tdoc}));
  }
});
