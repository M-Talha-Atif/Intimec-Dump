declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@catppuccin/highlightjs/css/*.css";
declare module "highlight.js/styles/*.css";
