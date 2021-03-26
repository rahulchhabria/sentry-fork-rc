import React from 'react';

import SvgIcon from './svgIcon';

type Props = React.ComponentProps<typeof SvgIcon>;

const IconSentryFull = React.forwardRef(function IconSentryFull(
  props: Props,
  ref: React.Ref<SVGSVGElement>
) {
  return (
    <svg viewBox="0 0 601 134" width="601" height="134" {...props} ref={ref}>
      <path
        d="M372.56 85.76l-44.49-57.43H317v77h11.22v-59l45.74 59h9.82v-77h-11.22v57.43zm-112-14.27h39.84v-10h-39.88V38.31h45v-10h-56.45v77h57v-10h-45.55l.04-23.82zm-46.84-9.78c-15.57-3.72-19.83-6.69-19.83-13.84 0-6.46 5.71-10.81 14.22-10.81 7.09 0 14.07 2.51 21.3 7.67l6.06-8.54c-8-6.13-16.65-9-27.13-9-15.25 0-25.89 9-25.89 21.92 0 13.84 9 18.63 25.5 22.63 14.51 3.35 18.93 6.5 18.93 13.5s-6 11.38-15.35 11.38c-9.07 0-16.81-3-25-9.82l-6.79 8.08a47.818 47.818 0 0 0 31.41 11.6c16.49 0 27.14-8.87 27.14-22.6-.02-11.65-6.91-17.88-24.61-22.17h.04zm373.9-33.37l-23.19 36.31-23-36.31H528l30.51 46.54v30.47h11.56V74.53l30.5-46.19h-12.95zM392.87 38.76h25.23v66.58h11.57V38.76h25.23V28.33h-62l-.03 10.43zM508.4 75.28c11.64-3.21 18-11.37 18-23 0-14.78-10.84-24-28.28-24H464v77h11.45V77.62h19.42l19.54 27.72h13.37l-21.1-29.58 1.72-.48zm-33-7.52V38.53H497c11.27 0 17.74 5.31 17.74 14.56 0 8.91-6.92 14.67-17.62 14.67H475.4zM86.9 7.43a13.749 13.749 0 0 0-23.81 0l-19.6 33.95 5 2.87a96.14 96.14 0 0 1 47.83 77.4H82.56a82.399 82.399 0 0 0-41-65.54l-5-2.86L18.3 85l5 2.87a46.354 46.354 0 0 1 22.46 33.78H14.33a2.266 2.266 0 0 1-1.995-1.121 2.27 2.27 0 0 1-.005-2.289l8.76-15.17a31.866 31.866 0 0 0-10-5.71L2.42 112.5a13.749 13.749 0 0 0 11.91 20.62h43.25v-5.73A57.161 57.161 0 0 0 33.84 81l6.88-11.92a70.929 70.929 0 0 1 30.56 58.26v5.74h36.65v-5.73A107.627 107.627 0 0 0 59.09 37.3L73 13.17a2.27 2.27 0 0 1 3.93 0l60.66 105.07a2.27 2.27 0 0 1-2 3.41H121.4c.18 3.83.2 7.66 0 11.48h14.24a13.745 13.745 0 0 0 13.749-13.746 13.742 13.742 0 0 0-1.839-6.874L86.9 7.43z"
        fill="currentColor"
      />
    </svg>
  );
});

IconSentryFull.displayName = 'IconSentryFull';

export {IconSentryFull};
