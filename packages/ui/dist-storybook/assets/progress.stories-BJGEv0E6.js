import{j as c}from"./jsx-dev-runtime-Ba3TwHiH.js";import{r as i}from"./index-DTfxifk3.js";import{j as h}from"./jsx-runtime-DIrC3W3p.js";import{P as G}from"./index-DV7ZoPzx.js";import{c as K}from"./utils-BQHNewu7.js";import"./index-ByHY9zvH.js";import"./index-wXZE6FB0.js";import"./index-CmUg0KLH.js";import"./index-DqQiz1RZ.js";import"./index-BVdRH-7D.js";function Q(e,r=[]){let t=[];function n(l,u){const s=i.createContext(u);s.displayName=l+"Context";const o=t.length;t=[...t,u];const p=d=>{var S;const{scope:m,children:E,...v}=d,f=((S=m==null?void 0:m[e])==null?void 0:S[o])||s,J=i.useMemo(()=>v,Object.values(v));return h.jsx(f.Provider,{value:J,children:E})};p.displayName=l+"Provider";function w(d,m){var f;const E=((f=m==null?void 0:m[e])==null?void 0:f[o])||s,v=i.useContext(E);if(v)return v;if(u!==void 0)return u;throw new Error(`\`${d}\` must be used within \`${l}\``)}return[p,w]}const a=()=>{const l=t.map(u=>i.createContext(u));return function(s){const o=(s==null?void 0:s[e])||l;return i.useMemo(()=>({[`__scope${e}`]:{...s,[e]:o}}),[s,o])}};return a.scopeName=e,[n,W(a,...r)]}function W(...e){const r=e[0];if(e.length===1)return r;const t=()=>{const n=e.map(a=>({useScope:a(),scopeName:a.scopeName}));return function(l){const u=n.reduce((s,{useScope:o,scopeName:p})=>{const d=o(l)[`__scope${p}`];return{...s,...d}},{});return i.useMemo(()=>({[`__scope${r.scopeName}`]:u}),[u])}};return t.scopeName=r.scopeName,t}var j="Progress",y=100,[Y]=Q(j),[Z,ee]=Y(j),X=i.forwardRef((e,r)=>{const{__scopeProgress:t,value:n=null,max:a,getValueLabel:l=re,...u}=e;(a||a===0)&&!V(a)&&console.error(se(`${a}`,"Progress"));const s=V(a)?a:y;n!==null&&!_(n,s)&&console.error(ae(`${n}`,"Progress"));const o=_(n,s)?n:null,p=P(o)?l(o,s):void 0;return h.jsx(Z,{scope:t,value:o,max:s,children:h.jsx(G.div,{"aria-valuemax":s,"aria-valuemin":0,"aria-valuenow":P(o)?o:void 0,"aria-valuetext":p,role:"progressbar","data-state":q(o,s),"data-value":o??void 0,"data-max":s,...u,ref:r})})});X.displayName=j;var B="ProgressIndicator",H=i.forwardRef((e,r)=>{const{__scopeProgress:t,...n}=e,a=ee(B,t);return h.jsx(G.div,{"data-state":q(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...n,ref:r})});H.displayName=B;function re(e,r){return`${Math.round(e/r*100)}%`}function q(e,r){return e==null?"indeterminate":e===r?"complete":"loading"}function P(e){return typeof e=="number"}function V(e){return P(e)&&!isNaN(e)&&e>0}function _(e,r){return P(e)&&!isNaN(e)&&e<=r&&e>=0}function se(e,r){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${r}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${y}\`.`}function ae(e,r){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${r}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${y} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var z=X,te=H;const D=i.forwardRef(({className:e,value:r,...t},n)=>c.jsxDEV(z,{ref:n,className:K("relative h-2 w-full overflow-hidden rounded-full border border-border bg-secondary/40",e),...t,children:c.jsxDEV(te,{className:"h-full w-full flex-1 bg-primary transition-all",style:{transform:`translateX(-${100-(r||0)}%)`}},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.tsx",lineNumber:20,columnNumber:5},void 0)},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.tsx",lineNumber:12,columnNumber:3},void 0));D.displayName=z.displayName;D.__docgenInfo={description:"",methods:[]};const fe={component:D,tags:["autodocs"],decorators:[e=>c.jsxDEV("div",{className:"w-full max-w-sm space-y-1",children:c.jsxDEV(e,{},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:8,columnNumber:9},void 0)},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:7,columnNumber:25},void 0)],argTypes:{value:{control:{type:"range",min:0,max:100,step:1}}}},x={args:{value:60}},g={args:{value:0}},N={args:{value:100}},b={render:()=>{const[e,r]=i.useState(0);return i.useEffect(()=>{const t=setInterval(()=>{r(n=>n>=80?(clearInterval(t),80):n+2)},40);return()=>clearInterval(t)},[]),c.jsxDEV("div",{className:"w-full max-w-sm space-y-2",children:[c.jsxDEV("div",{className:"flex justify-between text-sm",children:[c.jsxDEV("span",{className:"text-muted-foreground",children:"Loading…"},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:55,columnNumber:11},void 0),c.jsxDEV("span",{className:"font-medium tabular-nums",children:[e,"%"]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:56,columnNumber:11},void 0)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:54,columnNumber:9},void 0),c.jsxDEV(D,{value:e},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:58,columnNumber:9},void 0)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/ui/progress.stories.tsx",lineNumber:53,columnNumber:12},void 0)}};var I,$,C;x.parameters={...x.parameters,docs:{...(I=x.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    value: 60
  }
}`,...(C=($=x.parameters)==null?void 0:$.docs)==null?void 0:C.source}}};var R,k,U;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    value: 0
  }
}`,...(U=(k=g.parameters)==null?void 0:k.docs)==null?void 0:U.source}}};var M,A,L;N.parameters={...N.parameters,docs:{...(M=N.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    value: 100
  }
}`,...(L=(A=N.parameters)==null?void 0:A.docs)==null?void 0:L.source}}};var O,T,F;b.parameters={...b.parameters,docs:{...(O=b.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = React.useState(0);
    React.useEffect(() => {
      const timer = setInterval(() => {
        setValue(prev => {
          if (prev >= 80) {
            clearInterval(timer);
            return 80;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(timer);
    }, []);
    return <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Loading…</span>
          <span className="font-medium tabular-nums">{value}%</span>
        </div>
        <Progress value={value} />
      </div>;
  }
}`,...(F=(T=b.parameters)==null?void 0:T.docs)==null?void 0:F.source}}};const xe=["Default","Empty","Full","Animated"];export{b as Animated,x as Default,g as Empty,N as Full,xe as __namedExportsOrder,fe as default};
