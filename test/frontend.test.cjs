const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');

test('React 前端可通过 Hydro federation 构建，React 由宿主提供', async () => {
  const result = await esbuild.build({
    entryPoints: [path.join(root, 'frontend/resolver.page.tsx')],
    bundle: true, write: false, format: 'iife', target: 'chrome65',
    plugins: [{ name: 'hydro-federation', setup(build) {
      build.onResolve({ filter: /^(@hydrooj\/ui-default|react|react-dom)(\/.*)?$/ }, args => ({ path: args.path, namespace: 'hydro' }));
      build.onLoad({ filter: /.*/, namespace: 'hydro' }, args => ({ contents: `module.exports=window.HydroExports${args.path === 'react' ? '.React' : args.path.startsWith('react-dom') ? '.ReactDOM' : ''};` }));
    } }],
  });
  assert.ok(result.outputFiles[0].text.includes('window.HydroExports.React'));
});

// Run the resolver operation queue with inert DOM/animation hooks.
// No browser or production server is contacted by this regression check.
function harness(data) {
  const hooks = [];
  let cursor, main, props, tree, keyHandler;
  const React = {
    Fragment: 'fragment',
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = initial;
      return [hooks[index], value => { hooks[index] = typeof value === 'function' ? value(hooks[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },
    useMemo(callback, dependencies) {
      const ref = React.useRef(null);
      if (!ref.current || dependencies.some((value, index) => value !== ref.current.dependencies[index])) {
        ref.current = { dependencies, value: callback() };
      }
      return ref.current.value;
    },
  };
  const draw = () => { cursor = 0; tree = main(props); };
  const ui = { React, NamedPage: class {}, addPage() {}, ReactDOM: {
    createRoot: () => ({ render(element) { main = element.type; props = element.props; draw(); } }),
  } };
  const spring = { animated: { div: 'div' }, easings: { steps() {} }, useSprings(count, create) {
    const ref = React.useRef(null);
    if (!ref.current) ref.current = Array.from({ length: count }, (_, i) => create(i));
    return [ref.current, { start(update) { ref.current.forEach((value, i) => Object.assign(value, update(i))); return [Promise.resolve()]; } }];
  } };
  const window = { innerHeight: 1000, pageYOffset: 0, addEventListener() {}, removeEventListener() {},
    matchMedia: () => ({ matches: true }), scrollTo(value) { this.pageYOffset = value?.top ?? 0; } };
  const module = { exports: {} };
  const source = esbuild.transformSync(fs.readFileSync(path.join(root, 'frontend/resolver.page.tsx'), 'utf8'), { loader: 'tsx', format: 'cjs' }).code;
  vm.runInNewContext(source, {
    module, exports: module.exports, console, setTimeout, clearTimeout, window,
    document: { body: { scrollHeight: 5000 }, documentElement: { scrollHeight: 5000 }, getElementById() {} },
    $: () => ({ text() {} }),
    require(name) {
      if (name === '@hydrooj/ui-default') return ui;
      if (name === '@react-spring/web') return spring;
      if (name === 'react-use/lib/useKey') return (_, callback) => { keyHandler = callback; };
      throw new Error(name);
    },
  });
  module.exports.start(data, { showAvatar: true, showSchool: true });
  return {
    async next(repeat = false) { await keyHandler({ preventDefault() {}, repeat }); draw(); },
    rows: () => tree.props.children[0].map(row => ({
      id: row.props['data-team-id'], y: row.props.style.y,
      rank: row.props.children[0].props.children[0],
      solved: row.props.children[3].props.children[0],
      penalty: row.props.children[4].props.children[0],
      cells: row.props.children[2].props.children[1].props.children[0].map(cell => cell.props.children[0]),
    })),
    window,
  };
}

test('封榜前记录不重复计数；SE 按 Hydro 策略罚时；按秒重排并保留靠下滚动位置', async () => {
  const runtime = harness({ name: 'Fixture', duration: 7200, frozen: 300, problems: [{ id: 'A' }], institutions: {},
    teams: [{ id: '1', name: 'One' }, { id: '2', name: 'Two' }, { id: '3', name: 'Three' }],
    submissions: [
      { team: '1', problem: 'A', verdict: 'WA', time: 100, penalty: true },
      { team: '1', problem: 'A', verdict: 'AC', time: 400 },
      { team: '2', problem: 'A', verdict: 'CE', time: 100, penalty: false },
      { team: '2', problem: 'A', verdict: 'AC', time: 401 },
      { team: '3', problem: 'A', verdict: 'SE', time: 200, penalty: true },
      { team: '3', problem: 'A', verdict: 'AC', time: 399 },
    ],
  });
  const before = JSON.stringify(runtime.rows());
  await runtime.next(true);
  assert.equal(JSON.stringify(runtime.rows()), before, '忽略长按重复事件');
  for (let i = 0; i < 50; i++) await runtime.next();
  const rows = runtime.rows();
  assert.equal(rows.find(row => row.id === '1').cells[0], '2 / 6');
  assert.equal(rows.find(row => row.id === '3').cells[0], '2 / 6');
  assert.equal(rows.find(row => row.id === '2').cells[0], '1 / 6');
  assert.deepEqual(Array.from(rows, row => [row.id, row.rank, row.solved, row.penalty]), [['1', 3, 1, 26], ['2', 1, 1, 6], ['3', 2, 1, 26]]);
  assert.ok(runtime.window.pageYOffset >= 0, '越界滚动目标已限制到可达范围');
});

test('选中队伍后滚动到视口靠下位置', async () => {
  const runtime = harness({ name: 'Scroll', duration: 7200, frozen: 300,
    problems: [], submissions: [], institutions: {},
    teams: Array.from({ length: 20 }, (_, index) => ({ id: String(index), name: String(index) })),
  });
  await runtime.next();
  assert.equal(runtime.window.pageYOffset, 19 * 80 - 1000 + 241 + 40);
});
