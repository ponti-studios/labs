import{j as n}from"./jsx-dev-runtime-Ba3TwHiH.js";import{r as D}from"./index-DTfxifk3.js";import{c as w}from"./utils-BQHNewu7.js";import"./index-ByHY9zvH.js";const l=D.forwardRef(({className:e,...i},r)=>n.jsxDEV("textarea",{className:w("flex min-h-[60px] w-full rounded-md border border-border px-3 py-2 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",e),ref:r,...i},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/textarea.tsx",lineNumber:8,columnNumber:7},void 0));l.displayName="Textarea";l.__docgenInfo={description:"",methods:[],displayName:"Textarea"};const S={component:l,tags:["autodocs"],argTypes:{disabled:{control:"boolean"},placeholder:{control:"text"}}},s={args:{}},a={args:{placeholder:"Type your message…"}},t={args:{disabled:!0,placeholder:"This field is locked"}},o={render:()=>{const[e,i]=D.useState(""),r=200,c=r-e.length;return n.jsxDEV("div",{className:"flex flex-col gap-2 w-full max-w-sm",children:[n.jsxDEV(l,{value:e,onChange:T=>i(T.target.value.slice(0,r)),placeholder:"Type your message…",rows:4},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/textarea.stories.tsx",lineNumber:38,columnNumber:9},void 0),n.jsxDEV("p",{className:["text-xs text-right tabular-nums",c<=20?"text-destructive":"text-muted-foreground"].join(" "),children:[c," characters remaining"]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/textarea.stories.tsx",lineNumber:39,columnNumber:9},void 0)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/textarea.stories.tsx",lineNumber:37,columnNumber:12},void 0)}};var u,d,m;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {}
}`,...(m=(d=s.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,g,x;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    placeholder: "Type your message…"
  }
}`,...(x=(g=a.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var f,b,h;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "This field is locked"
  }
}`,...(h=(b=t.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var v,N,y;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = React.useState("");
    const limit = 200;
    const remaining = limit - value.length;
    return <div className="flex flex-col gap-2 w-full max-w-sm">
        <Textarea value={value} onChange={e => setValue(e.target.value.slice(0, limit))} placeholder="Type your message…" rows={4} />
        <p className={["text-xs text-right tabular-nums", remaining <= 20 ? "text-destructive" : "text-muted-foreground"].join(" ")}>
          {remaining} characters remaining
        </p>
      </div>;
  }
}`,...(y=(N=o.parameters)==null?void 0:N.docs)==null?void 0:y.source}}};const C=["Default","WithPlaceholder","Disabled","Controlled"];export{o as Controlled,s as Default,t as Disabled,a as WithPlaceholder,C as __namedExportsOrder,S as default};
