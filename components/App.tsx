"use client";
import { useState, useMemo } from "react";

function fnv1a(str: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
function derive(addr: string, salt = "") {
  const h1 = fnv1a(addr + salt + "score");
  const h2 = fnv1a(addr + salt + "days");
  const h3 = fnv1a(addr + salt + "val");
  const h4 = fnv1a(addr + salt + "pnl");
  const h5 = fnv1a(addr + salt + "supply");
  return {
    score: 40 + (h1 % 61),
    days: 30 + (h2 % 800),
    value: ((h3 % 9000) + 100) * 1000,
    pnl: (h4 % 600) - 50,
    supply: ((h5 % 400) + 1) / 1000,
  };
}

const TOKENS = [
  { sym:"SOL",  name:"Solana",     mint:"So111111…11111112", price:178.42, mcap:"84.20B", avgHold:412, diamond:62.4, score:87 },
  { sym:"BONK", name:"Bonk",       mint:"DezXAZ8z…B263",    price:0.000021, mcap:"1.42B", avgHold:298, diamond:44.1, score:71 },
  { sym:"JUP",  name:"Jupiter",    mint:"JUPyiwrY…vCN",     price:0.82, mcap:"2.28B", avgHold:246, diamond:51.7, score:79 },
  { sym:"WIF",  name:"dogwifhat",  mint:"EKpQGSJt…3oC",     price:1.24, mcap:"1.24B", avgHold:189, diamond:38.2, score:64 },
  { sym:"PYTH", name:"Pyth",       mint:"HZ1JovNi…TBq",     price:0.31, mcap:"0.89B", avgHold:374, diamond:55.3, score:82 },
  { sym:"RNDR", name:"Render",     mint:"rndrizKT…Bof",     price:3.71, mcap:"3.51B", avgHold:334, diamond:58.9, score:83 },
];

const WALLETS_RAW = [
  "ysaM7xKL8ceymU","Es9DXRrHYaTC","BGLPU7fmTu6Z","3hDQRCa963io","H5rFVzz7ccbM",
  "95JFE8jiJ2Ad","YwTRjzAktrY5","vcJ3N4q5nQGj","C9oLCikfT8iF","frBLXhykkdb5",
  "8swqL6izRL88","FEUG14USEtvd","mJcBKPgCUcbx","uB2f1eg8C6GY","oxR4TtEhpWrL",
  "ES5qPSgaBqQW","JxrKjTsVxGyL","s2cvMF7b4ZcV","yPYoXbDWrjTu","c2dWebiePAuB",
  "WKtgW1u5rWT2","fcsZB3ZeCDjm","LP2QUJXq4w9s","Z5dZjm6ddNnv","w18s1gKLxzck",
  "eWSVBm5iEYE3","myphyUEA2NTC","YwEXJMXJTSaF","yQ163Dm11mrW","kBKnKbeHskod",
  "CkM3rHwg5LQq","sWJsTUwE5bFs","qYfaceLHvn8t","DezAEimCmcEu","tF2ptdQvFV9y",
  "vuoLDc4e7Lv6","EdRsuajtBMZH","FVtVo7my78cK","oyh8jp9xWkjW","X3T3gVGZUmbS",
  "WkYc9ckKEcTp","t5ihci2qUq2Y","XnkADMTNosZv","4TQm9oy9FAzD","qRZRSw1ECrGT",
  "86QmtwuK3vaF","AtiUH8pxiiiM","GSDYzLBExnYM","xRi5RqGLxsEX","xB3gb4jmbDg1",
];

const WALLETS = WALLETS_RAW.map((addr) => {
  const d = derive(addr);
  const topToken = TOKENS[fnv1a(addr) % TOKENS.length];
  return { addr, score: d.score, days: d.days, value: d.value, pnl: d.pnl, supply: d.supply, topToken: topToken.sym, tokens: 4 };
}).sort((a, b) => b.score - a.score);

function scoreColor(s: number) { return s >= 80 ? "#4ADE80" : s >= 50 ? "#FACC15" : "#F87171"; }
function fmt(n: number) {
  if (n >= 1e9) return "$" + (n/1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n/1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n/1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}
function short(addr: string) { return addr.slice(0,6) + "…" + addr.slice(-6); }

const G = {
  bg:"#060810", surface:"#0C0F1A", border:"#131929",
  accent:"#4ADE80", accentDim:"rgba(74,222,128,0.12)",
  text:"#E2E8F0", muted:"#4B5563", dim:"#1E293B",
  font:"'IBM Plex Mono', 'JetBrains Mono', monospace",
};

function Nav({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  return (
    <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(6,8,16,.95)",borderBottom:`1px solid ${G.border}`,backdropFilter:"blur(10px)" }}>
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }} onClick={()=>setPage("home")}>
          <span style={{ fontSize:18,color:G.accent }}>◆</span>
          <span style={{ fontSize:13,fontWeight:700,letterSpacing:".12em",color:G.text,fontFamily:G.font }}>DIAMOND<span style={{color:G.accent}}>HANDS</span></span>
        </div>
        <div style={{ display:"flex",gap:28 }}>
          {[["home","HOME"],["explorer","TOKEN EXPLORER"],["leaderboard","LEADERBOARD"]].map(([p,l])=>(
            <span key={p} onClick={()=>setPage(p)} style={{ color:page===p?G.accent:G.muted,fontSize:12,letterSpacing:".1em",cursor:"pointer",fontFamily:G.font,transition:"color .2s" }}>{l}</span>
          ))}
        </div>
        <button onClick={()=>{}} style={{ background:"transparent",border:`1px solid ${G.border}`,color:G.muted,padding:"7px 14px",borderRadius:6,fontFamily:G.font,fontSize:11,letterSpacing:".1em",cursor:"pointer" }}>
          CONNECT WALLET
        </button>
      </div>
    </nav>
  );
}

function Home({ setPage }: { setPage: (p: string) => void }) {
  const topTokens = [...TOKENS].sort((a,b)=>b.score-a.score).slice(0,3);
  return (
    <div>
      <div style={{ padding:"80px 24px 60px",textAlign:"center",position:"relative",backgroundImage:"linear-gradient(rgba(74,222,128,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,.03) 1px,transparent 1px)",backgroundSize:"40px 40px" }}>
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(74,222,128,.08),transparent)",pointerEvents:"none" }} />
        <div style={{ maxWidth:680,margin:"0 auto",position:"relative" }}>
          <div style={{ display:"inline-block",background:G.accentDim,border:"1px solid rgba(74,222,128,.2)",borderRadius:4,padding:"4px 14px",fontSize:10,color:G.accent,letterSpacing:".15em",marginBottom:24,fontFamily:G.font }}>MVP · LIVE ON SOLANA MAINNET</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,48px)",fontWeight:700,lineHeight:1.15,marginBottom:20,color:G.text,fontFamily:G.font }}>
            Find Solana&apos;s <span style={{color:G.accent}}>diamond hands</span><br/>before everyone else.
          </h1>
          <p style={{ fontSize:14,color:G.muted,lineHeight:1.7,marginBottom:36,maxWidth:520,margin:"0 auto 36px",fontFamily:G.font }}>
            On-chain conviction scoring for SPL tokens. Surface wallets that hold through every dip, track their next moves, and discover tokens with the strongest long-term holder behavior.
          </p>
          <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
            <button onClick={()=>setPage("explorer")} style={{ background:G.accent,color:"#060810",border:"none",padding:"10px 22px",borderRadius:6,fontFamily:G.font,fontSize:12,fontWeight:700,letterSpacing:".1em",cursor:"pointer" }}>EXPLORE TOKENS</button>
            <button onClick={()=>setPage("leaderboard")} style={{ background:"transparent",border:`1px solid ${G.border}`,color:G.muted,padding:"10px 22px",borderRadius:6,fontFamily:G.font,fontSize:12,letterSpacing:".1em",cursor:"pointer" }}>VIEW LEADERBOARD</button>
          </div>
        </div>
      </div>
      <div style={{ borderTop:`1px solid ${G.border}`,borderBottom:`1px solid ${G.border}`,background:G.surface,padding:"18px 24px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"center",gap:60 }}>
          {[["6","TOKENS TRACKED"],["1K+","WALLETS INDEXED"],["263d","AVG HOLD TIME"],["98","TOP SCORE"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22,fontWeight:700,color:G.accent,fontFamily:G.font }}>{v}</div>
              <div style={{ fontSize:9,color:G.muted,letterSpacing:".12em",marginTop:3,fontFamily:G.font }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"48px 24px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:48 }}>
          {[
            { icon:"◆",title:"Diamond Score",desc:"0–100 conviction rating per wallet. Formula weighs duration, no-sell behavior, accumulation, supply consistency, and drawdown tolerance." },
            { icon:"⬡",title:"Token Explorer",desc:"Drop in any SPL mint. Get the top 50 holders ranked by Diamond Score, average hold time, and supply % held by long-term hands." },
            { icon:"⬢",title:"Conviction Leaderboard",desc:"Surface tokens with the strongest holder base and wallets with elite scores across multiple tokens — the alpha feed." },
          ].map((f)=>(
            <div key={f.title} style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:24 }}>
              <div style={{ fontSize:20,color:G.accent,marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontSize:13,fontWeight:600,letterSpacing:".06em",marginBottom:10,fontFamily:G.font }}>{f.title}</div>
              <div style={{ fontSize:12,color:G.muted,lineHeight:1.65,fontFamily:G.font }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontSize:11,fontWeight:600,letterSpacing:".12em",color:G.muted,fontFamily:G.font }}>TOP CONVICTION TOKENS</div>
          <span onClick={()=>setPage("leaderboard")} style={{ fontSize:11,color:G.accent,cursor:"pointer",letterSpacing:".08em",fontFamily:G.font }}>SEE ALL →</span>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          {topTokens.map((t,i)=>(
            <div key={t.sym} onClick={()=>setPage("explorer")} style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"20px 24px",cursor:"pointer" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:10,color:G.muted,letterSpacing:".12em",marginBottom:4,fontFamily:G.font }}>#{i+1}</div>
                  <div style={{ fontSize:15,fontWeight:700,fontFamily:G.font }}>{t.sym}</div>
                  <div style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{t.name}</div>
                </div>
                <div style={{ fontSize:16,fontWeight:700,color:G.accent,fontFamily:G.font }}>◆{t.score}</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[["MKT CAP","$"+t.mcap],["DIAMOND %",t.diamond+"%"],["AVG HOLD",t.avgHold+"d"]].map(([l,v])=>(
                  <div key={l}>
                    <div style={{ fontSize:9,color:G.muted,letterSpacing:".1em",marginBottom:3,fontFamily:G.font }}>{l}</div>
                    <div style={{ fontSize:12,fontWeight:600,fontFamily:G.font }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Explorer() {
  const [activeToken, setActiveToken] = useState(TOKENS[0]);
  const [sortCol, setSortCol] = useState("score");
  const [sortDir, setSortDir] = useState("desc");

  const holders = useMemo(() => {
    return WALLETS_RAW.map(addr => {
      const score = 40 + (fnv1a(addr + activeToken.sym + "s") % 61);
      const days = 30 + (fnv1a(addr + activeToken.sym + "d") % 800);
      const value = ((fnv1a(addr + activeToken.sym + "v") % 9000) + 100) * 1000;
      const pnl = (fnv1a(addr + activeToken.sym + "p") % 600) - 50;
      const supply = ((fnv1a(addr + activeToken.sym + "su") % 400) + 1) / 1000;
      return { addr, score, days, value, pnl, supply };
    }).sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      const av = a[sortCol as keyof typeof a] as number; const bv = b[sortCol as keyof typeof b] as number; return dir * (av - bv);
    });
  }, [activeToken, sortCol, sortDir]);

  const dist = useMemo(() => {
    const bins: Record<string,number> = { "80-100":0,"60-79":0,"40-59":0,"<40":0 };
    holders.forEach(h => {
      if (h.score>=80) bins["80-100"]++; else if (h.score>=60) bins["60-79"]++;
      else if (h.score>=40) bins["40-59"]++; else bins["<40"]++;
    });
    return bins;
  }, [holders]);

  const toggleSort = (col: string) => {
    if (sortCol===col) setSortDir(d=>d==="desc"?"asc":"desc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const SortBtn = ({ col, label }: { col: string; label: string }) => (
    <button onClick={()=>toggleSort(col)} style={{ background:"none",border:"none",color:sortCol===col?G.accent:G.muted,cursor:"pointer",fontFamily:G.font,fontSize:10,letterSpacing:".1em",padding:0 }}>
      {label}{sortCol===col?(sortDir==="desc"?" ↓":" ↑"):""}
    </button>
  );

  return (
    <div style={{ maxWidth:1100,margin:"0 auto",padding:"40px 24px" }}>
      <h1 style={{ fontSize:22,fontWeight:700,marginBottom:6,fontFamily:G.font }}>Token Explorer</h1>
      <p style={{ fontSize:12,color:G.muted,marginBottom:28,fontFamily:G.font }}>Analyze the holder base of any SPL token by Diamond Score, holding duration, and conviction.</p>
      <div style={{ display:"flex",gap:8,marginBottom:28,flexWrap:"wrap" }}>
        {TOKENS.map(t=>(
          <button key={t.sym} onClick={()=>setActiveToken(t)} style={{ padding:"6px 14px",borderRadius:4,background:G.surface,border:`1px solid ${activeToken.sym===t.sym?G.accent:G.border}`,color:activeToken.sym===t.sym?G.accent:G.muted,fontSize:11,letterSpacing:".08em",cursor:"pointer",fontFamily:G.font,fontWeight:600,transition:"all .2s" }}>{t.sym}</button>
        ))}
      </div>
      <div style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"24px 28px",marginBottom:24 }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20,marginBottom:20 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6 }}>
              <span style={{ fontSize:20,fontWeight:700,fontFamily:G.font }}>{activeToken.sym}</span>
              <span style={{ fontSize:13,color:G.muted,fontFamily:G.font }}>{activeToken.name}</span>
            </div>
            <div style={{ fontSize:24,fontWeight:700,color:G.accent,fontFamily:G.font }}>◆{activeToken.score}</div>
          </div>
          <div style={{ display:"flex",gap:36,flexWrap:"wrap" }}>
            {[["PRICE","$"+activeToken.price],["MKT CAP","$"+activeToken.mcap],["DIAMOND %",activeToken.diamond+"%"],["AVG HOLD",activeToken.avgHold+"d"]].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontSize:9,color:G.muted,letterSpacing:".1em",marginBottom:4,fontFamily:G.font }}>{l}</div>
                <div style={{ fontSize:15,fontWeight:600,fontFamily:G.font }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop:18,borderTop:`1px solid ${G.border}` }}>
          <div style={{ fontSize:9,color:G.muted,letterSpacing:".12em",marginBottom:12,fontFamily:G.font }}>SCORE DISTRIBUTION</div>
          <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:48 }}>
            {Object.entries(dist).map(([label,count])=>{
              const maxC = Math.max(...Object.values(dist));
              const h = Math.round((count/maxC)*44);
              const col = label==="80-100"?"#4ADE80":label==="60-79"?"#FACC15":label==="40-59"?"#FB923C":"#F87171";
              return (
                <div key={label} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                  <div style={{ width:"100%",background:col,opacity:.7,borderRadius:"2px 2px 0 0",height:h,minHeight:3 }} />
                  <div style={{ fontSize:9,color:G.muted,fontFamily:G.font }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,overflow:"hidden" }}>
        <div style={{ padding:"12px 20px",borderBottom:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between" }}>
          <div style={{ fontSize:10,color:G.muted,letterSpacing:".1em",fontFamily:G.font }}>TOP {holders.length} HOLDERS</div>
          <div style={{ fontSize:10,color:G.muted,fontFamily:G.font }}>DEMO DATA</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"36px 1fr 90px 90px 100px 80px 80px",padding:"9px 20px",borderBottom:`1px solid ${G.border}`,fontSize:9,color:G.muted,letterSpacing:".1em",fontFamily:G.font }}>
          <span>#</span><span>WALLET</span>
          <SortBtn col="score" label="SCORE" />
          <SortBtn col="days" label="HELD" />
          <span>VALUE</span><span>SUPPLY %</span>
          <SortBtn col="pnl" label="PNL" />
        </div>
        <div style={{ maxHeight:440,overflowY:"auto" }}>
          {holders.map((h,i)=>(
            <div key={h.addr} style={{ display:"grid",gridTemplateColumns:"36px 1fr 90px 90px 100px 80px 80px",padding:"10px 20px",borderBottom:"1px solid rgba(19,25,41,.8)" }}>
              <span style={{ fontSize:11,color:i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:G.muted,fontFamily:G.font }}>{i+1}</span>
              <span style={{ fontSize:11,color:"#94A3B8",fontFamily:G.font }}>{short(h.addr)}</span>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:36,height:3,borderRadius:2,background:"#1e293b",overflow:"hidden",display:"inline-block" }}>
                  <div style={{ width:`${h.score}%`,height:"100%",background:scoreColor(h.score),borderRadius:2 }} />
                </div>
                <span style={{ fontSize:12,fontWeight:600,color:scoreColor(h.score),fontFamily:G.font }}>◆{h.score}</span>
              </div>
              <span style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{h.days}d</span>
              <span style={{ fontSize:11,fontFamily:G.font }}>{fmt(h.value)}</span>
              <span style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{h.supply.toFixed(3)}%</span>
              <span style={{ fontSize:11,color:h.pnl>=0?"#4ADE80":"#F87171",fontFamily:G.font }}>{h.pnl>=0?"+":""}{h.pnl.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const [tab, setTab] = useState("wallets");
  const topTokens = [...TOKENS].sort((a,b)=>b.score-a.score);

  return (
    <div style={{ maxWidth:1100,margin:"0 auto",padding:"40px 24px" }}>
      <h1 style={{ fontSize:22,fontWeight:700,marginBottom:6,fontFamily:G.font }}>Leaderboard</h1>
      <p style={{ fontSize:12,color:G.muted,marginBottom:28,fontFamily:G.font }}>Wallets and tokens with the strongest conviction on Solana.</p>
      <div style={{ display:"flex",gap:8,marginBottom:24 }}>
        {[["wallets","TOP WALLETS"],["tokens","TOP TOKENS"],["alpha","ALPHA FEED"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ background:"transparent",border:`1px solid ${tab===k?G.accent:G.border}`,color:tab===k?G.accent:G.muted,padding:"8px 18px",borderRadius:6,fontFamily:G.font,fontSize:11,letterSpacing:".1em",cursor:"pointer",transition:"all .2s" }}>{l}</button>
        ))}
      </div>
      {tab==="wallets" && (
        <div style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,overflow:"hidden" }}>
          <div style={{ padding:"12px 20px",borderBottom:`1px solid ${G.border}` }}>
            <div style={{ fontSize:10,color:G.muted,letterSpacing:".1em",fontFamily:G.font }}>TOP 50 WALLETS BY DIAMOND SCORE</div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"40px 1fr 90px 100px 70px 80px 100px",padding:"9px 20px",borderBottom:`1px solid ${G.border}`,fontSize:9,color:G.muted,letterSpacing:".1em",fontFamily:G.font }}>
            <span>#</span><span>WALLET</span><span>SCORE</span><span>TOP TOKEN</span><span>TOKENS</span><span>HELD</span><span>VALUE</span>
          </div>
          <div style={{ maxHeight:520,overflowY:"auto" }}>
            {WALLETS.map((w,i)=>(
              <div key={w.addr} style={{ display:"grid",gridTemplateColumns:"40px 1fr 90px 100px 70px 80px 100px",padding:"10px 20px",borderBottom:"1px solid rgba(19,25,41,.8)" }}>
                <span style={{ fontSize:11,color:i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:G.muted,fontWeight:i<3?700:400,fontFamily:G.font }}>{i+1}</span>
                <span style={{ fontSize:11,color:"#94A3B8",fontFamily:G.font }}>{short(w.addr)}</span>
                <span style={{ fontSize:12,fontWeight:600,color:scoreColor(w.score),fontFamily:G.font }}>◆{w.score}</span>
                <span style={{ fontSize:10,background:G.dim,padding:"2px 8px",borderRadius:3,fontFamily:G.font,display:"inline-block" }}>{w.topToken}</span>
                <span style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{w.tokens}</span>
                <span style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{w.days}d</span>
                <span style={{ fontSize:11,fontFamily:G.font }}>{fmt(w.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="tokens" && (
        <div style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,overflow:"hidden" }}>
          <div style={{ padding:"12px 20px",borderBottom:`1px solid ${G.border}` }}>
            <div style={{ fontSize:10,color:G.muted,letterSpacing:".1em",fontFamily:G.font }}>TOKENS RANKED BY CONVICTION</div>
          </div>
          {topTokens.map((t,i)=>(
            <div key={t.sym} style={{ display:"grid",gridTemplateColumns:"40px 1fr 80px 100px 80px 80px",padding:"12px 20px",borderBottom:"1px solid rgba(19,25,41,.8)" }}>
              <span style={{ fontSize:11,color:i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:G.muted,fontFamily:G.font }}>{i+1}</span>
              <div><span style={{ fontSize:13,fontWeight:600,marginRight:8,fontFamily:G.font }}>{t.sym}</span><span style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{t.name}</span></div>
              <span style={{ fontSize:12,fontWeight:600,color:G.accent,fontFamily:G.font }}>◆{t.score}</span>
              <span style={{ fontSize:11,fontFamily:G.font }}>${t.mcap}</span>
              <span style={{ fontSize:11,color:"#4ADE80",fontFamily:G.font }}>{t.diamond}%</span>
              <span style={{ fontSize:11,color:G.muted,fontFamily:G.font }}>{t.avgHold}d</span>
            </div>
          ))}
        </div>
      )}
      {tab==="alpha" && (
        <div style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:32,textAlign:"center" }}>
          <div style={{ fontSize:24,marginBottom:12 }}>⚡</div>
          <div style={{ fontSize:13,fontWeight:600,marginBottom:8,fontFamily:G.font }}>Alpha Feed</div>
          <div style={{ fontSize:12,color:G.muted,lineHeight:1.7,maxWidth:400,margin:"0 auto 24px",fontFamily:G.font }}>Track when top Diamond Hands wallets (◆90+) move into new positions. Get alerts before the crowd notices.</div>
          <button style={{ background:G.accent,color:"#060810",border:"none",padding:"10px 22px",borderRadius:6,fontFamily:G.font,fontSize:11,fontWeight:700,letterSpacing:".1em",cursor:"pointer" }}>UNLOCK ALERTS — COMING SOON</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div style={{ minHeight:"100vh",background:G.bg,fontFamily:G.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#0a0d16}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
      `}</style>
      <Nav page={page} setPage={setPage} />
      {page==="home" && <Home setPage={setPage} />}
      {page==="explorer" && <Explorer />}
      {page==="leaderboard" && <Leaderboard />}
      <div style={{ borderTop:`1px solid ${G.border}`,padding:"16px 24px",textAlign:"center",fontSize:10,color:G.dim,letterSpacing:".1em",marginTop:40,fontFamily:G.font }}>
        DIAMONDHANDS · ON-CHAIN CONVICTION ANALYTICS FOR SOLANA · v0.1 · MVP
      </div>
    </div>
  );
}
