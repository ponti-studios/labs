import{j as f}from"./jsx-dev-runtime-Ba3TwHiH.js";import{r as v}from"./index-DTfxifk3.js";import"./index-ByHY9zvH.js";function L(e,a=1.5,r=0){const[n,s]=v.useState(r);return v.useEffect(()=>{if(e===r){s(e);return}const t=Date.now(),g=e-r;let o=0;const u=()=>{const P=Date.now()-t,x=Math.min(P/(a*1e3),1),w=1-(1-x)**3,I=r+g*w;s(I),x<1?o=requestAnimationFrame(u):s(e)};return o=requestAnimationFrame(u),()=>{cancelAnimationFrame(o)}},[e,a,r]),n}function O(e,a=0,r=","){const s=e.toFixed(a).split("."),t=s[0].replace(/\B(?=(\d{3})+(?!\d))/g,r);return s.length>1?`${t}.${s[1]}`:t}function A({value:e,duration:a=1.5,separator:r=",",start:n=0,decimals:s=0,prefix:t="",suffix:g=""}){const o=L(e,a,n),u=O(o,s,r);return f.jsxDEV("span",{children:[t,u,g]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/count-up-to.tsx",lineNumber:74,columnNumber:5},this)}A.__docgenInfo={description:"",methods:[],displayName:"CountUpTo",props:{value:{required:!0,tsType:{name:"number"},description:""},duration:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1.5",computed:!1}},separator:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'","',computed:!1}},start:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},decimals:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},prefix:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},suffix:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const z={component:A,tags:["autodocs"],decorators:[e=>f.jsxDEV("div",{className:"flex items-center justify-center",children:f.jsxDEV("span",{className:"text-5xl font-light tabular-nums",children:f.jsxDEV(e,{},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/count-up-to.stories.tsx",lineNumber:9,columnNumber:11},void 0)},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/count-up-to.stories.tsx",lineNumber:8,columnNumber:9},void 0)},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/count-up-to.stories.tsx",lineNumber:7,columnNumber:25},void 0)],argTypes:{value:{control:{type:"number"}},duration:{control:{type:"number"}},separator:{control:{type:"text"}},prefix:{control:{type:"text"}},suffix:{control:{type:"text"}},decimals:{control:{type:"number"}}}},c={args:{value:1e3}},i={args:{value:4999,prefix:"$"}},l={args:{value:75,suffix:"%"}},m={args:{value:3.14159,decimals:2}},p={args:{value:1e6,duration:2}},d={args:{value:100,duration:.5}};var b,h,N;c.parameters={...c.parameters,docs:{...(b=c.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    value: 1000
  }
}`,...(N=(h=c.parameters)==null?void 0:h.docs)==null?void 0:N.source}}};var y,D,T;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    value: 4999,
    prefix: "$"
  }
}`,...(T=(D=i.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var q,S,E;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    value: 75,
    suffix: "%"
  }
}`,...(E=(S=l.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var V,j,U;m.parameters={...m.parameters,docs:{...(V=m.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    value: 3.14159,
    decimals: 2
  }
}`,...(U=(j=m.parameters)==null?void 0:j.docs)==null?void 0:U.source}}};var F,W,C;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    value: 1000000,
    duration: 2
  }
}`,...(C=(W=p.parameters)==null?void 0:W.docs)==null?void 0:C.source}}};var k,_,$;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    value: 100,
    duration: 0.5
  }
}`,...($=(_=d.parameters)==null?void 0:_.docs)==null?void 0:$.source}}};const G=["Default","WithPrefix","WithSuffix","WithDecimals","LargeNumber","Fast"];export{c as Default,d as Fast,p as LargeNumber,m as WithDecimals,i as WithPrefix,l as WithSuffix,G as __namedExportsOrder,z as default};
