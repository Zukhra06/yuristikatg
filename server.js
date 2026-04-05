'use strict';
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_q, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── CARD DATA ──────────────────────────────────────────────────────────────
const PACKS = {
  general: {
    name: 'Общее право', free: true,
    кейс: [
      { id:'k1', text:'Сосед затопил квартиру, платить отказывается.',            hint:'ГК РФ ст. 1064 — полное возмещение. Акт → оценка → претензия → суд.' },
      { id:'k2', text:'Работодатель не платил зарплату 2 месяца.',                hint:'ТК РФ ст. 142, 236 — приостановка работы + 1/150 ключевой ставки в день.' },
      { id:'k3', text:'Смартфон сломался через 5 дней, магазин отказывает.',      hint:'Закон о ЗПП ст. 18 — в 15 дней при существенном недостатке: возврат или замена.' },
      { id:'k4', text:'Арендодатель требует выехать, договора нет.',               hint:'ГК РФ ст. 687 — требуйте разумный срок (≥ 3 мес.). Фиксируйте переписку.' },
      { id:'k5', text:'Интернет-магазин не доставил товар за 45 дней.',           hint:'Закон о ЗПП ст. 23.1 — 0,5% в день + возврат. Роспотребнадзор + суд.' },
      { id:'k6', text:'Вынуждают уволиться по-собственному под угрозой статьи.',  hint:'ТК РФ ст. 394 — принуждение незаконно. Трудовая инспекция + иск.' },
      { id:'k7', text:'Банк списал деньги за услугу без согласия.',               hint:'Жалоба в Банк России. Банк обязан вернуть средства.' },
      { id:'k8', text:'Сосед поставил забор на вашей земле.',                     hint:'ГК РФ ст. 304 — негаторный иск. Кадастровый инженер → суд.' },
    ],
    термин: [
      { id:'t1', word:'Эмансипация',              hint:'Объявление несовершеннолетнего (с 16 лет) полностью дееспособным. ГК РФ ст. 27.' },
      { id:'t2', word:'Субсидиарная ответственность', hint:'Допответственность, если основной должник не платит. ГК РФ ст. 399.' },
      { id:'t3', word:'Виндикационный иск',       hint:'Требование вернуть вещь из чужого незаконного владения. ГК РФ ст. 301.' },
      { id:'t4', word:'Деликт',                   hint:'Причинение вреда вне договора. Влечёт деликтную ответственность.' },
      { id:'t5', word:'Презумпция невиновности',  hint:'Обвиняемый невиновен, пока не доказано обратное. КРФ ст. 49.' },
      { id:'t6', word:'Дееспособность',           hint:'Способность своими действиями приобретать права. Полная — с 18. ГК РФ ст. 21.' },
      { id:'t7', word:'Залог',                    hint:'Кредитор берёт стоимость из залога при неисполнении. ГК РФ ст. 334.' },
      { id:'t8', word:'Исковая давность',         hint:'Срок для защиты права через суд. Общий — 3 года. ГК РФ ст. 196.' },
      { id:'t9', word:'Апелляция',                hint:'Обжалование не вступившего в силу решения суда.' },
      { id:'t10',word:'Аффилированное лицо',      hint:'Лицо, влияющее на компанию через участие в капитале или должность.' },
    ],
    кодекс: [
      { id:'c1', q:'Срок подачи апелляционной жалобы?',                   a:'30 дней',   hint:'ГПК РФ ст. 321.' },
      { id:'c2', q:'Полная гражданская дееспособность наступает в…?',      a:'18 лет',    hint:'ГК РФ ст. 21.' },
      { id:'c3', q:'Общий срок исковой давности?',                         a:'3 года',    hint:'ГК РФ ст. 196.' },
      { id:'c4', q:'Макс. испытательный срок при найме (общее)?',          a:'3 месяца',  hint:'ТК РФ ст. 70.' },
      { id:'c5', q:'До какого возраста платятся алименты на ребёнка?',     a:'18 лет',    hint:'СК РФ ст. 120.' },
      { id:'c6', q:'Срок принятия наследства?',                            a:'6 месяцев', hint:'ГК РФ ст. 1154.' },
      { id:'c7', q:'Дней на возврат товара из интернет-магазина?',         a:'7 дней',    hint:'Закон о ЗПП ст. 26.1.' },
      { id:'c8', q:'За сколько дней предупреждают об увольнении?',         a:'14 дней',   hint:'ТК РФ ст. 80.' },
    ],
    судья: [
      { id:'s1', q:'Работодатель читает корпоративную почту без ведома сотрудника. Законно?',     hint:'КРФ ст. 23 — тайна переписки. Но корпоративная почта — ресурс работодателя. Суды поддерживают его при наличии IT-политики.' },
      { id:'s2', q:'Блогер написал правдивый плохой отзыв. Ресторан требует удалить пост.',        hint:'ГК РФ ст. 152 — иск только за недостоверные сведения. Правдивый отзыв защищён.' },
      { id:'s3', q:'ИИ банка отказал в кредите без объяснений. Можно оспорить?',                  hint:'ФЗ «О персональных данных» — объяснение автоматизированного решения можно запросить. Ответственность — банка.' },
      { id:'s4', q:'Муниципалитет сносит детскую площадку без слушаний. Жители против.',          hint:'ГрК РФ — слушания обязательны. Жители вправе оспорить.' },
      { id:'s5', q:'Мать пропустила срок апелляции из-за болезни ребёнка. Суд отказал восстановить.', hint:'ГПК РФ ст. 112 — уважительная причина. Болезнь ребёнка — спорное основание. Практика разная.' },
    ]
  },
  criminal: {
    name: 'Уголовное право', free: false,
    кейс: [
      { id:'cr1', text:'Обвиняемый говорит, что показания выбиты под давлением.', hint:'УПК РФ ст. 75 — недопустимые доказательства. Ходатайство об исключении.' },
      { id:'cr2', text:'Задержан без постановления, сидит 60 часов.',             hint:'УПК РФ ст. 94 — без суда макс. 48 ч. Жалоба прокурору → освобождение.' },
      { id:'cr3', text:'Свидетель отказывается говорить против родственника.',     hint:'КРФ ст. 51 — никто не обязан свидетельствовать против близких.' },
    ],
    термин: [
      { id:'ct1', word:'Рецидив',             hint:'Умышленное преступление лицом с судимостью за умышленное. УК РФ ст. 18.' },
      { id:'ct2', word:'Соучастие',           hint:'Совместное участие 2+ лиц в умышленном преступлении. УК РФ ст. 32.' },
      { id:'ct3', word:'Крайняя необходимость', hint:'Вред для устранения опасности, которую нельзя устранить иначе. УК РФ ст. 39.' },
    ],
    кодекс: [
      { id:'cc1', q:'Уголовная ответственность по общему правилу — с…?', a:'16 лет', hint:'УК РФ ст. 20. За тяжкие — с 14.' },
      { id:'cc2', q:'Макс. задержание без суда?',                        a:'48 часов', hint:'КРФ ст. 22, УПК РФ ст. 94.' },
    ],
    судья: [
      { id:'cs1', q:'Самооборона с превышением пределов — преступление?',       hint:'УК РФ ст. 114 — привилегированный состав, до 2 лет. Оценивается реальность угрозы.' },
      { id:'cs2', q:'Опьянение — смягчающее или отягчающее обстоятельство?',    hint:'УК РФ ст. 63 — на усмотрение суда. Прежде было автоматически отягчающим.' },
    ]
  },
  civil: {
    name: 'Гражд. процесс', free: false,
    кейс: [
      { id:'gp1', text:'Иск подан в суд общей юрисдикции, но ответчик — ИП.',    hint:'АПК РФ ст. 27 — споры с ИП рассматривает арбитражный суд.' },
      { id:'gp2', text:'После решения суда ответчик скрывает имущество.',        hint:'ГПК РФ ст. 139 — обеспечительные меры: арест имущества.' },
    ],
    термин: [
      { id:'gpt1', word:'Встречный иск',      hint:'Иск ответчика к истцу в том же деле. ГПК РФ ст. 137.' },
      { id:'gpt2', word:'Мировое соглашение', hint:'Договор сторон об окончании спора, утверждаемый судом. ГПК РФ ст. 173.' },
    ],
    кодекс: [
      { id:'gpc1', q:'Срок кассационной жалобы?',                       a:'3 месяца',   hint:'ГПК РФ ст. 376.1.' },
      { id:'gpc2', q:'Госпошлина за неимущественный иск физлица?',       a:'300 рублей', hint:'НК РФ ст. 333.19.' },
    ],
    судья: [
      { id:'gps1', q:'Свидетель — друг истца. Ответчик требует отвода. Обоснованно?', hint:'ГПК РФ — отвода свидетелей нет. Знакомство влияет на оценку показаний, не на отвод.' },
    ]
  },
  family: {
    name: 'Семейное право', free: false,
    кейс: [
      { id:'fk1', text:'Муж хочет развода, жена беременна.',             hint:'СК РФ ст. 17 — муж не вправе без согласия жены в период беременности.' },
      { id:'fk2', text:'После развода муж скрыл вклад в банке.',          hint:'СК РФ ст. 38 — совместно нажитое делится поровну. Иск о разделе.' },
    ],
    термин: [
      { id:'ft1', word:'Брачный договор', hint:'Соглашение об имущественных правах супругов. СК РФ ст. 40.' },
      { id:'ft2', word:'Алименты',        hint:'Средства на содержание членов семьи. СК РФ гл. 13-15.' },
    ],
    кодекс: [
      { id:'fc1', q:'Минимальный возраст для вступления в брак?', a:'18 лет', hint:'СК РФ ст. 13. С разрешения МСУ — с 16.' },
    ],
    судья: [
      { id:'fs1', q:'Ребёнку 14 лет. Обязан ли суд учесть его мнение при разводе родителей?', hint:'СК РФ ст. 57 — мнение с 10 лет. После 14 — приоритетно.' },
    ]
  },
  labor: {
    name: 'Трудовое право', free: false,
    кейс: [
      { id:'lk1', text:'Перевели на другую должность без согласия.',      hint:'ТК РФ ст. 72 — постоянный перевод только с письменного согласия.' },
      { id:'lk2', text:'Уволили беременную за опоздания.',                hint:'ТК РФ ст. 261 — увольнение беременной по инициативе работодателя запрещено.' },
    ],
    термин: [
      { id:'lt1', word:'Дисциплинарное взыскание', hint:'Замечание, выговор или увольнение за нарушение дисциплины. ТК РФ ст. 192.' },
      { id:'lt2', word:'Коллективный договор',      hint:'Акт между работниками и работодателем об условиях труда. ТК РФ ст. 40.' },
    ],
    кодекс: [
      { id:'lc1', q:'Нормальная продолжительность рабочей недели?', a:'40 часов',  hint:'ТК РФ ст. 91.' },
      { id:'lc2', q:'Продолжительность основного отпуска?',          a:'28 дней',   hint:'ТК РФ ст. 115.' },
    ],
    судья: [
      { id:'ls1', q:'Работодатель запрещает обсуждать зарплату. Законно?', hint:'ТК РФ не запрещает работникам обсуждать свою зарплату между собой.' },
    ]
  }
};

// ── BOARD ──────────────────────────────────────────────────────────────────
const CELLS = ['старт','кейс','термин','кодекс','судья','кейс','бонус','термин',
  'кодекс','кейс','судья','термин','кодекс','кейс','судья','термин',
  'штраф','кодекс','кейс','судья','термин','финиш'];
const COLOURS = ['#E05D28','#1A9968','#6B5FCC','#D4832A','#C44472','#2871CC'];

// ── HELPERS ────────────────────────────────────────────────────────────────
const rndCode = () => Math.random().toString(36).substring(2,8).toUpperCase();
function pickCard(gs, type) {
  const deck = (PACKS[gs.pack]||PACKS.general)[type]||[];
  let avail = deck.filter(c => !gs.used[type].includes(c.id));
  if (!avail.length) { gs.used[type]=[]; avail=deck; }
  if (!avail.length) return null;
  const c = avail[Math.floor(Math.random()*avail.length)];
  gs.used[type].push(c.id);
  return {...c, type};
}
function nextTurn(gs) {
  gs.cur=(gs.cur+1)%gs.players.length;
  gs.dice=null; gs.phase='roll'; gs.card=null; gs.votes={}; gs.notif='';
}

// ── ROOMS ──────────────────────────────────────────────────────────────────
const rooms = new Map();

io.on('connection', socket => {
  socket.on('create', ({name}) => {
    const code = rndCode();
    rooms.set(code, { code, phase:'lobby', gs:null,
      players:[{id:socket.id, name, host:true}] });
    socket.join(code); socket.data.code=code;
    socket.emit('created', {code, players:rooms.get(code).players, myId:socket.id});
  });

  socket.on('join', ({code,name}) => {
    const c=(code||'').toUpperCase().trim(), room=rooms.get(c);
    if (!room)              return socket.emit('err','❌ Комната не найдена');
    if (room.phase!=='lobby') return socket.emit('err','❌ Игра уже началась');
    if (room.players.length>=6) return socket.emit('err','❌ Комната заполнена');
    room.players.push({id:socket.id, name, host:false});
    socket.join(c); socket.data.code=c;
    socket.emit('joined',{code:c, players:room.players, myId:socket.id});
    socket.to(c).emit('lobby',{players:room.players});
  });

  socket.on('start',({code,pack})=>{
    const room=rooms.get(code); if(!room) return;
    if (!room.players.find(p=>p.id===socket.id&&p.host)) return;
    if (room.players.length<2) return socket.emit('err','❌ Нужно минимум 2 игрока');
    const pk=PACKS[pack]?pack:'general';
    room.phase='playing';
    room.gs={
      players:room.players.map((p,i)=>({sid:p.id,name:p.name,color:COLOURS[i%6],pos:0,score:0})),
      cur:0,dice:null,phase:'roll',card:null,votes:{},notif:'',pack:pk,
      used:{кейс:[],термин:[],кодекс:[],судья:[]}
    };
    io.to(code).emit('started',{gs:room.gs});
  });

  socket.on('roll',({code})=>{
    const room=rooms.get(code); if(!room?.gs) return;
    const gs=room.gs;
    if (gs.players[gs.cur].sid!==socket.id||gs.phase!=='roll') return;
    const val=Math.floor(Math.random()*6)+1; gs.dice=val;
    const p=gs.players[gs.cur];
    p.pos=Math.min(p.pos+val,CELLS.length-1);
    const cell=CELLS[p.pos];
    if (cell==='бонус') {
      p.score+=2; gs.phase='wait'; gs.notif=`⭐ ${p.name} +2 балла!`;
      io.to(code).emit('update',{gs});
      setTimeout(()=>{nextTurn(gs);io.to(code).emit('update',{gs});},2000);
    } else if (cell==='штраф') {
      p.score=Math.max(0,p.score-1); gs.phase='wait'; gs.notif=`❌ ${p.name} −1 балл`;
      io.to(code).emit('update',{gs});
      setTimeout(()=>{nextTurn(gs);io.to(code).emit('update',{gs});},2000);
    } else if (cell==='финиш') {
      gs.phase='ended'; io.to(code).emit('update',{gs});
      setTimeout(()=>io.to(code).emit('ended',{gs}),600);
    } else if (['кейс','термин','кодекс','судья'].includes(cell)) {
      gs.card=pickCard(gs,cell); gs.phase=cell==='судья'?'vote':'card';
      io.to(code).emit('update',{gs});
    } else { gs.phase='roll'; io.to(code).emit('update',{gs}); }
  });

  socket.on('answer',({code,ok})=>{
    const room=rooms.get(code); if(!room?.gs) return;
    const gs=room.gs; if(gs.phase!=='card') return;
    if (!room.players.find(p=>p.id===socket.id&&p.host)) return;
    if(ok) gs.players[gs.cur].score+=2;
    nextTurn(gs); io.to(code).emit('update',{gs});
  });

  socket.on('vote',({code,v})=>{
    const room=rooms.get(code); if(!room?.gs) return;
    const gs=room.gs; if(gs.phase!=='vote') return;
    gs.votes[socket.id]=v; io.to(code).emit('update',{gs});
    const others=room.players.filter(p=>p.id!==gs.players[gs.cur].sid);
    if(others.length&&others.every(p=>gs.votes[p.id]!==undefined)){
      const vals=Object.values(gs.votes);
      if(vals.filter(x=>x==='for').length>vals.length/2) gs.players[gs.cur].score+=3;
      nextTurn(gs); io.to(code).emit('update',{gs});
    }
  });

  socket.on('disconnecting',()=>{
    const code=socket.data.code, room=rooms.get(code); if(!room) return;
    const i=room.players.findIndex(p=>p.id===socket.id); if(i===-1) return;
    const wasHost=room.players[i].host; room.players.splice(i,1);
    if(!room.players.length){rooms.delete(code);return;}
    if(wasHost) room.players[0].host=true;
    io.to(code).emit('lobby',{players:room.players});
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,'0.0.0.0',()=>console.log('Юристика TG: порт '+PORT));
