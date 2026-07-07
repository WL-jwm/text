import React from 'react';

export function PrintFooter() {
  return React.createElement('div', { className: 'print-footer', style: { display: 'none' } },
    React.createElement('span', null, '河北地下水基础资料数据库 v3.5.2')
  );
}

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };
  return React.createElement('button', {
    onClick: handlePrint,
    className: 'fixed bottom-4 right-4 z-50 p-2 bg-gw-blue text-white rounded-full shadow-lg hover:bg-gw-blue/80 transition-colors print:hidden',
    title: '打印',
    'aria-label': '打印页面',
  }, React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('polyline', { points: '6 9 6 2 18 2 18 9' }),
    React.createElement('path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' }),
    React.createElement('rect', { x: '6', y: '14', width: '12', height: '8' })
  ));
}
