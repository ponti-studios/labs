import{j as e}from"./jsx-dev-runtime-Ba3TwHiH.js";import{r as T}from"./index-DTfxifk3.js";import{c as C}from"./utils-BQHNewu7.js";import{A as R,a as S,b as q,c as P}from"./accordion-CpIwNyQu.js";import"./index-ByHY9zvH.js";import"./index-BqE1vAZC.js";import"./jsx-runtime-DIrC3W3p.js";import"./index-wXZE6FB0.js";import"./index-CmUg0KLH.js";import"./index-BVdRH-7D.js";import"./index-DTBB7Alf.js";import"./index-YXYkCjz3.js";function o({items:i,showIndex:r=!0,contentClassName:p,renderContent:c,value:f,onValueChange:a,defaultValue:b,...g}){const[t,n]=T.useState(b),x=f??t;return e.jsxDEV(R,{type:"single",collapsible:!0,value:x,onValueChange:s=>{n(s||void 0),a==null||a(s)},...g,children:i.map((s,N)=>e.jsxDEV(S,{value:s.id,children:[e.jsxDEV(q,{index:r?N:void 0,badge:s.badge,aside:s.aside,children:s.title},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:55,columnNumber:11},this),e.jsxDEV(P,{className:p,children:c?c(s,N):s.content},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:62,columnNumber:11},this)]},s.id,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:54,columnNumber:9},this))},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:43,columnNumber:5},this)}function I({items:i,columns:r,value:p,defaultValue:c,onValueChange:f,className:a,...b}){const g=i.map(t=>({id:t.id,title:t.title,badge:t.badge?e.jsxDEV("span",{className:"hidden text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 sm:block",children:t.badge},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:110,columnNumber:7},this):void 0,aside:e.jsxDEV("span",{className:"hidden text-right md:block",children:[e.jsxDEV("span",{className:"block text-lg font-normal tabular-nums",children:t.metric},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:116,columnNumber:9},this),e.jsxDEV("span",{className:"block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/50",children:t.metricLabel},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:117,columnNumber:9},this)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:115,columnNumber:7},this)}));return e.jsxDEV("div",{className:C("mt-16",a),...b,children:[r&&e.jsxDEV("div",{className:"hidden border-b border-border px-6 pb-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end",children:[e.jsxDEV("span",{className:"text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50",children:r.item},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:128,columnNumber:11},this),e.jsxDEV("span",{className:"text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50",children:r.type},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:131,columnNumber:11},this),e.jsxDEV("span",{className:"text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50",children:r.result},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:134,columnNumber:11},this),e.jsxDEV("span",{},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:137,columnNumber:11},this)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:127,columnNumber:9},this),e.jsxDEV(o,{items:g,value:p,defaultValue:c,onValueChange:f,renderContent:t=>{const n=i.find(x=>x.id===t.id);return n?e.jsxDEV(e.Fragment,{children:[e.jsxDEV("p",{className:"mb-1 text-sm font-medium tabular-nums md:hidden",children:[n.metric," ",e.jsxDEV("span",{className:"text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground",children:n.metricLabel},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:153,columnNumber:17},this)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:151,columnNumber:15},this),e.jsxDEV("p",{className:"max-w-2xl text-sm leading-7 text-muted-foreground",children:n.description},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:157,columnNumber:15},this)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:150,columnNumber:13},this):null}},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:140,columnNumber:7},this)]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.tsx",lineNumber:125,columnNumber:5},this)}o.__docgenInfo={description:"",methods:[],displayName:"AccordionList",props:{items:{required:!0,tsType:{name:"unknown"},description:""},showIndex:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},contentClassName:{required:!1,tsType:{name:"string"},description:""},value:{required:!1,tsType:{name:"string"},description:""},defaultValue:{required:!1,tsType:{name:"string"},description:""},onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},renderContent:{required:!1,tsType:{name:"signature",type:"function",raw:"(item: AccordionListItem, index: number) => React.ReactNode",signature:{arguments:[{type:{name:"AccordionListItem"},name:"item"},{type:{name:"number"},name:"index"}],return:{name:"ReactReactNode",raw:"React.ReactNode"}}},description:""}},composes:["Omit"]};I.__docgenInfo={description:"",methods:[],displayName:"MetricAccordionList",props:{items:{required:!0,tsType:{name:"unknown"},description:""},columns:{required:!1,tsType:{name:"MetricAccordionListColumns"},description:""},value:{required:!1,tsType:{name:"string"},description:""},defaultValue:{required:!1,tsType:{name:"string"},description:""},onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""}},composes:["Omit"]};const Q={component:o,tags:["autodocs"]},l={render:()=>e.jsxDEV(o,{className:"w-full max-w-2xl",showIndex:!0,items:[{id:"item-1",title:"What is your refund policy?",content:"We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact support and we will issue a full refund."},{id:"item-2",title:"How do I cancel my subscription?",content:"You can cancel at any time from the billing settings page. Your access remains active until the end of the current billing period."},{id:"item-3",title:"Do you offer enterprise plans?",content:"Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our sales team to learn more about pricing and features."}]},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:11,columnNumber:17},void 0)},d={render:()=>e.jsxDEV(o,{className:"w-full max-w-2xl",showIndex:!0,items:[{id:"item-1",title:"New integration available",badge:e.jsxDEV("span",{className:"rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground",children:"New"},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:29,columnNumber:12},void 0),content:"We've added native support for Slack, Linear, and GitHub integrations — available in all plan tiers."},{id:"item-2",title:"Updated billing flow",badge:e.jsxDEV("span",{className:"rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground",children:"Updated"},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:36,columnNumber:12},void 0),content:"The checkout flow has been streamlined, reducing the number of steps from five to two."},{id:"item-3",title:"Legacy API endpoints",badge:e.jsxDEV("span",{className:"rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground",children:"Deprecated"},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:43,columnNumber:12},void 0),content:"The v1 REST endpoints will be removed on January 1st. Please migrate to the v2 API before that date."}]},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:26,columnNumber:17},void 0)},m={render:()=>e.jsxDEV(o,{className:"w-full max-w-2xl",showIndex:!0,items:[{id:"item-1",title:"Design principles"},{id:"item-2",title:"Engineering philosophy"},{id:"item-3",title:"Product strategy"}],renderContent:(i,r)=>e.jsxDEV("p",{className:"italic text-muted-foreground",children:["Custom content for item ",r+1,", rendered via the"," ",e.jsxDEV("code",{className:"rounded bg-muted px-1 font-mono text-xs not-italic",children:"renderContent"},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:61,columnNumber:11},void 0)," ","prop. Override the default content display with any React node."]},void 0,!0,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:59,columnNumber:39},void 0)},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:50,columnNumber:17},void 0)},u={render:()=>e.jsxDEV(I,{className:"mt-0 w-full max-w-3xl",columns:{item:"Metric",type:"Category",result:"Score"},items:[{id:"metric-1",title:"Page load speed",badge:"Performance",metric:"98",metricLabel:"score",description:"Pages load in under 1.2 seconds on average, measured across all devices and connection types globally."},{id:"metric-2",title:"Uptime SLA",badge:"Reliability",metric:"99.9%",metricLabel:"uptime",description:"Our infrastructure maintains a 99.9% uptime guarantee backed by a multi-region active-active failover architecture."},{id:"metric-3",title:"Customer satisfaction",badge:"Support",metric:"4.9",metricLabel:"avg rating",description:"Customers rate our support interactions 4.9 out of 5 stars, based on over 12,000 survey responses in the last quarter."}]},void 0,!1,{fileName:"/Users/charlesponti/Developer/labs/packages/ui/src/components/compound/accordion-list.stories.tsx",lineNumber:66,columnNumber:17},void 0)};var h,v,y;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <AccordionList className="w-full max-w-2xl" showIndex items={[{
    id: "item-1",
    title: "What is your refund policy?",
    content: "We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact support and we will issue a full refund."
  }, {
    id: "item-2",
    title: "How do I cancel my subscription?",
    content: "You can cancel at any time from the billing settings page. Your access remains active until the end of the current billing period."
  }, {
    id: "item-3",
    title: "Do you offer enterprise plans?",
    content: "Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our sales team to learn more about pricing and features."
  }]} />
}`,...(y=(v=l.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var D,w,k;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <AccordionList className="w-full max-w-2xl" showIndex items={[{
    id: "item-1",
    title: "New integration available",
    badge: <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              New
            </span>,
    content: "We've added native support for Slack, Linear, and GitHub integrations — available in all plan tiers."
  }, {
    id: "item-2",
    title: "Updated billing flow",
    badge: <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              Updated
            </span>,
    content: "The checkout flow has been streamlined, reducing the number of steps from five to two."
  }, {
    id: "item-3",
    title: "Legacy API endpoints",
    badge: <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
              Deprecated
            </span>,
    content: "The v1 REST endpoints will be removed on January 1st. Please migrate to the v2 API before that date."
  }]} />
}`,...(k=(w=d.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var E,U,V;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <AccordionList className="w-full max-w-2xl" showIndex items={[{
    id: "item-1",
    title: "Design principles"
  }, {
    id: "item-2",
    title: "Engineering philosophy"
  }, {
    id: "item-3",
    title: "Product strategy"
  }]} renderContent={(item, index) => <p className="italic text-muted-foreground">
          Custom content for item {index + 1}, rendered via the{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs not-italic">renderContent</code>{" "}
          prop. Override the default content display with any React node.
        </p>} />
}`,...(V=(U=m.parameters)==null?void 0:U.docs)==null?void 0:V.source}}};var j,L,A;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <MetricAccordionList className="mt-0 w-full max-w-3xl" columns={{
    item: "Metric",
    type: "Category",
    result: "Score"
  }} items={[{
    id: "metric-1",
    title: "Page load speed",
    badge: "Performance",
    metric: "98",
    metricLabel: "score",
    description: "Pages load in under 1.2 seconds on average, measured across all devices and connection types globally."
  }, {
    id: "metric-2",
    title: "Uptime SLA",
    badge: "Reliability",
    metric: "99.9%",
    metricLabel: "uptime",
    description: "Our infrastructure maintains a 99.9% uptime guarantee backed by a multi-region active-active failover architecture."
  }, {
    id: "metric-3",
    title: "Customer satisfaction",
    badge: "Support",
    metric: "4.9",
    metricLabel: "avg rating",
    description: "Customers rate our support interactions 4.9 out of 5 stars, based on over 12,000 survey responses in the last quarter."
  }]} />
}`,...(A=(L=u.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};const X=["Default","WithBadges","CustomRenderer","Metric"];export{m as CustomRenderer,l as Default,u as Metric,d as WithBadges,X as __namedExportsOrder,Q as default};
