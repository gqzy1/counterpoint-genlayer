export const examples=[
  {id:'gallery',title:['The gallery entrance','展馆入口'],subtitle:['Can a counterargument restore a challenged idea?','反驳的反驳，能否让一个论点重新站稳？'],question:'Should the exhibition place a plinth across the entrance ramp?',
    arguments:[
      {id:'A1',author:'Mara',title:'Keep the only ramp clear',zh:'让唯一的坡道保持畅通',text:'The exhibition should not place the plinth at the entrance because doing so would block the only wheelchair ramp.',explain:['This proposal rests on the entrance being the only accessible route.','这个提议的前提是：入口坡道是唯一无障碍通道。']},
      {id:'A2',author:'Mara',title:'The west ramp is closed',zh:'西侧坡道已经关闭',text:'The west-side ramp is closed for the entire exhibition. Its existence therefore does not establish that a second accessible route is available.',explain:['An objection to a premise can defend an earlier argument.','质疑一个前提，可以间接捍卫先前的论点。']},
      {id:'B1',author:'Jules',title:'There is a second ramp',zh:'还有第二条坡道',text:'The exhibition may place the plinth at the entrance. A second wheelchair ramp is available on the west side, so the entrance ramp is not the only accessible route.',explain:['A claimed alternative route challenges the original conclusion.','声称存在的另一条通道，对原有结论提出了反驳。']},
      {id:'B2',author:'Jules',title:'Print a tactile route guide',zh:'印制触觉路线指南',text:'The exhibition should print a tactile route guide, helping visitors understand the accessible routes before they arrive.',explain:['A useful adjacent idea does not necessarily attack another idea.','一个有价值的补充观点，并不一定是在反驳另一个观点。']}
    ],challenges:[
      {source:'A2',target:'B1',kind:'UNDERCUT',label:['Include the closure objection','加入“坡道关闭”的质疑'],reason:['A closed ramp cannot support the claim that an alternative accessible route is available.','已关闭的坡道，不能支持“另一条通道可用”的前提。'],on:true},
      {source:'B1',target:'A1',kind:'REBUTTAL',label:['Include the alternative route','加入“第二条通道”的反驳'],reason:['Allowing the plinth at the entrance directly opposes keeping it away from that entrance.','允许在入口放置展台，直接反对不应放置的结论。'],on:true},
      {source:'B2',target:'A1',kind:'NOT_ATTACK',label:['Propose the guide as a challenge','将路线指南当作反驳'],reason:['Printing a guide does not establish that blocking the only ramp is acceptable.','印制指南，并不能证明堵住唯一坡道是可接受的。'],on:true}
    ]},
  {id:'loop',title:['Two doors, one unresolved loop','两扇门，一个未解的循环'],subtitle:['Some disagreements should stay open.','有些分歧，应该保持开放。'],question:'Which entrance should the temporary exhibition use?',
    arguments:[
      {id:'A1',author:'Mara',title:'Only the north door',zh:'只开放北门',text:'Only the north entrance may be used during the exhibition. The south entrance must remain closed throughout the exhibition.',explain:['This directly conflicts with the opposite entrance rule.','这与另一条入口规则直接冲突。']},
      {id:'A2',author:'Mara',title:'Keep the signs legible',zh:'让标识清晰可读',text:'All exhibition signs should use large readable type so visitors can identify the entrance from a distance.',explain:['This argument is not challenged in this limited discussion.','在本次讨论中，没有对这个论点提出反驳。']},
      {id:'B1',author:'Jules',title:'Only the south door',zh:'只开放南门',text:'Only the south entrance may be used during the exhibition. The north entrance must remain closed throughout the exhibition.',explain:['A circular attack has no unchallenged starting point.','相互反驳的循环，没有一个未受质疑的起点。']},
      {id:'B2',author:'Jules',title:'Publish a route map',zh:'公布路线图',text:'A route map should be published before the exhibition opens, marking whichever entrance is eventually chosen.',explain:['A conditional route map can coexist with either outcome.','条件式的路线图提议，可以与两种结果共存。']}
    ],challenges:[
      {source:'A1',target:'B1',kind:'REBUTTAL',label:['Include the north-door rule','加入北门规则'],reason:['The two exclusive entrance rules cannot both hold.','两条排他性的入口规则，不能同时成立。'],on:true},
      {source:'B1',target:'A1',kind:'REBUTTAL',label:['Include the south-door rule','加入南门规则'],reason:['Neither argument has an accepted defender that breaks the loop.','没有可接受的捍卫者打破这一循环。'],on:true}
    ]},
  {id:'tangent',title:['A useful thought. A different question.','有用的想法，另一个问题。'],subtitle:['Being relevant is not the same as refuting.','相关，并不等于反驳。'],question:'Should the exhibition keep the quiet room silent?',
    arguments:[
      {id:'A1',author:'Mara',title:'Keep the quiet room silent',zh:'让静室保持安静',text:'The quiet room should remain silent during opening hours because visitors use it specifically to get away from noise.',explain:['The promise of quiet is the reason under discussion.','这里讨论的是对安静的承诺。']},
      {id:'A2',author:'Mara',title:'Explain the room at the door',zh:'在门口说明用途',text:'A sign outside the quiet room should explain its purpose before visitors enter so expectations are clear.',explain:['No attack has been proposed against this argument.','尚未对这个论点提出反驳。']},
      {id:'B1',author:'Jules',title:'Make the courtyard lively',zh:'让庭院热闹起来',text:'The separate outdoor courtyard should host live music because an energetic arrival can make the exhibition more welcoming.',explain:['A lively separate courtyard does not contradict a silent indoor room.','独立庭院的热闹，并不否定室内静室的安静。']},
      {id:'B2',author:'Jules',title:'Offer earplugs elsewhere',zh:'在其他区域提供耳塞',text:'Visitors in the music courtyard should be offered earplugs if they prefer a lower listening volume.',explain:['Related subject matter alone does not create an attack.','仅仅主题相关，并不能构成反驳。']}
    ],challenges:[{source:'B1',target:'A1',kind:'NOT_ATTACK',label:['Propose music as a rebuttal','将音乐提议当作反驳'],reason:['The music proposal concerns a separate courtyard, not noise inside the quiet room.','音乐提议针对的是独立庭院，而不是静室内的噪声。'],on:true}]
  }
];
export function voiceFromExample(example,seat){const letter=String.fromCharCode(65+seat);return{arguments:example.arguments.filter(a=>a.id.startsWith(letter)).map(({title,text})=>({title,text})),challenges:example.challenges.filter(e=>e.source.startsWith(letter)&&e.on).map(e=>({source:e.source,target:e.target,basis:e.reason[0]}))};}
