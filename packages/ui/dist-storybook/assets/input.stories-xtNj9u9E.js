import{j as t}from"./jsx-dev-runtime-Ba3TwHiH.js";import{r as N}from"./index-DTfxifk3.js";import{I as v}from"./input-BShTzxiA.js";import"./index-ByHY9zvH.js";import"./utils-BQHNewu7.js";const y={component:v,tags:["autodocs"],argTypes:{disabled:{control:"boolean"},type:{control:"text"},placeholder:{control:"text"}}},e={args:{}},r={args:{placeholder:"Enter email…",type:"email"}},a={args:{disabled:!0,placeholder:"Disabled input"}},s={render:()=>{const[o,b]=N.useState("Controlled value");return t.jsxDEV("div",{className:"flex flex-col gap-2 w-full max-w-sm",children:[t.jsxDEV(v,{value:o,onChange:D=>b(D.target.value)},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/input.stories.tsx",lineNumber:40,columnNumber:9},void 0),t.jsxDEV("p",{className:"text-xs text-muted-foreground",children:[o.length," characters"]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/input.stories.tsx",lineNumber:41,columnNumber:9},void 0)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/input.stories.tsx",lineNumber:39,columnNumber:12},void 0)}};var l,n,c;e.parameters={...e.parameters,docs:{...(l=e.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {}
}`,...(c=(n=e.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var u,i,p;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter email…",
    type: "email"
  }
}`,...(p=(i=r.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var m,d,g;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Disabled input"
  }
}`,...(g=(d=a.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var x,h,f;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = React.useState("Controlled value");
    return <div className="flex flex-col gap-2 w-full max-w-sm">
        <Input value={value} onChange={e => setValue(e.target.value)} />
        <p className="text-xs text-muted-foreground">{value.length} characters</p>
      </div>;
  }
}`,...(f=(h=s.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};const C=["Default","WithPlaceholder","Disabled","WithValue"];export{e as Default,a as Disabled,r as WithPlaceholder,s as WithValue,C as __namedExportsOrder,y as default};
