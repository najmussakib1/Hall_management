(()=>{var a={};a.id=889,a.ids=[889],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},866:(a,b,c)=>{"use strict";c.d(b,{A:()=>m});let d=require("better-sqlite3");var e=c.n(d),f=c(3873),g=c.n(f);let h=require("fs");var i=c.n(h);let j=g().join(process.cwd(),"data");i().existsSync(j)||i().mkdirSync(j,{recursive:!0});let k=g().join(j,"hall_management.db"),l=new(e())(k);l.pragma("journal_mode = WAL"),l.pragma("foreign_keys = ON"),global.__hall_db_initialized||(!function(){l.exec(`
    CREATE TABLE IF NOT EXISTS halls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 500,
      monthly_fee REAL NOT NULL DEFAULT 2000.0,
      location TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'manager', -- 'superadmin' | 'manager'
      hall_id INTEGER,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hall_id INTEGER NOT NULL DEFAULT 1,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      room_number TEXT NOT NULL,
      department TEXT,
      session TEXT,
      monthly_fee REAL NOT NULL DEFAULT 1500.0,
      status TEXT NOT NULL DEFAULT 'resident', -- 'resident', 'former', 'suspended'
      admission_date DATE DEFAULT (DATE('now')),
      guardian_name TEXT,
      guardian_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_no TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      month_year TEXT NOT NULL,
      amount_paid REAL NOT NULL,
      due_adjusted REAL DEFAULT 0.0,
      payment_method TEXT DEFAULT 'Cash',
      transaction_id TEXT,
      remarks TEXT,
      received_by TEXT DEFAULT 'Manager',
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      month_year TEXT,
      amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0.0,
      status TEXT DEFAULT 'unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);try{l.exec("ALTER TABLE dues ADD COLUMN paid_amount REAL DEFAULT 0.0;")}catch(a){}try{l.exec("ALTER TABLE managers ADD COLUMN hall_id INTEGER REFERENCES halls(id);")}catch(a){}try{l.exec("ALTER TABLE managers ADD COLUMN email TEXT;")}catch(a){}try{l.exec("ALTER TABLE managers ADD COLUMN phone TEXT;")}catch(a){}try{l.exec("ALTER TABLE students ADD COLUMN hall_id INTEGER DEFAULT 1;")}catch(a){}try{l.exec("ALTER TABLE halls ADD COLUMN monthly_fee REAL DEFAULT 2000.0;")}catch(a){}if(0===l.prepare("SELECT COUNT(*) as count FROM halls").get().count){let a=l.prepare(`
      INSERT INTO halls (id, name, code, capacity, monthly_fee, location, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);a.run(1,"Sher-e-Bangla Hall","SBH",450,2e3,"North Campus Zone A","Premier male residential hall"),a.run(2,"Begum Rokeya Hall","BRH",500,2e3,"South Campus Zone B","Premier female residential hall"),a.run(3,"Fazlul Huq Muslim Hall","FHMH",400,2e3,"Central Science Campus","Undergraduate and graduate hall"),a.run(4,"Shahidullah Hall","SHH",380,2e3,"East Campus Quad","Science faculty residential hall")}if(l.prepare(`
    INSERT OR IGNORE INTO managers (id, username, password, name, role, hall_id)
    VALUES (100, 'superadmin', 'admin123', 'Central University Controller', 'superadmin', NULL)
  `).run(),l.prepare(`
    INSERT OR IGNORE INTO managers (id, username, password, name, role, hall_id, email, phone)
    VALUES (1, 'manager', 'admin123', 'Chief Hall Provost / Manager', 'manager', 1, 'manager.sbh@university.edu', '01711223344')
  `).run(),l.prepare("UPDATE managers SET hall_id = 1 WHERE username = 'manager' AND hall_id IS NULL").run(),0===l.prepare("SELECT COUNT(*) as count FROM students").get().count){let a=l.prepare(`
      INSERT OR IGNORE INTO students (student_id, hall_id, name, email, phone, room_number, department, session, monthly_fee, status, guardian_name, guardian_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),b=a.run("CSE-2022-042",1,"Tariqul Islam","tariq@example.com","01711000001","302-A","Computer Science & Engineering","2021-2022",2e3,"resident","Md. Rafiqul Islam","01811000001"),c=a.run("EEE-2022-115",1,"Nusrat Jahan","nusrat@example.com","01711000002","205-B","Electrical & Electronic Eng.","2021-2022",2e3,"resident","Nazmul Huda","01811000002"),d=a.run("BBA-2023-088",1,"Sadman Shakib","sadman@example.com","01711000003","108-A","Business Administration","2022-2023",2e3,"resident","Kazi Mahbub","01811000003"),e=a.run("ME-2021-019",2,"Farhana Yesmin","farhana@example.com","01711000004","412-C","Mechanical Engineering","2020-2021",2e3,"resident","Ali Ahmed","01811000004");a.run("CE-2023-054",2,"Farzana Akter","farzana@example.com","01711000005","210-A","Civil Engineering","2022-2023",2e3,"resident","Abdur Rashid","01811000005");let f=l.prepare("INSERT INTO dues (student_id, title, month_year, amount, status) VALUES (?, ?, ?, ?, ?)");b.lastInsertRowid&&f.run(b.lastInsertRowid,"Monthly Fee - September 2026","September 2026",2500,"unpaid"),c.lastInsertRowid&&f.run(c.lastInsertRowid,"Monthly Fee - August 2026","August 2026",2500,"paid"),d.lastInsertRowid&&f.run(d.lastInsertRowid,"Utility & Maintenance Due","September 2026",600,"unpaid"),e.lastInsertRowid&&f.run(e.lastInsertRowid,"Monthly Fee - September 2026","September 2026",2500,"unpaid");let g=l.prepare(`
      INSERT OR IGNORE INTO payments (receipt_no, student_id, month_year, amount_paid, payment_method, remarks, received_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);c.lastInsertRowid&&g.run("REC-20260901-001",c.lastInsertRowid,"August 2026",2500,"Cash","Cleared in full with August rent","Manager")}}(),global.__hall_db_initialized=!0);let m=l},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:a=>{"use strict";a.exports=require("path")},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5511:a=>{"use strict";a.exports=require("crypto")},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},6487:()=>{},6926:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>A,patchFetch:()=>z,routeModule:()=>v,serverHooks:()=>y,workAsyncStorage:()=>w,workUnitAsyncStorage:()=>x});var d=c(9225),e=c(4006),f=c(8317),g=c(9373),h=c(4775),i=c(4235),j=c(261),k=c(4365),l=c(771),m=c(3461),n=c(7798),o=c(2280),p=c(2018),q=c(5696),r=c(7929),s=c(6439),t=c(246),u=c(7527);let v=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/halls/[id]/report/route",pathname:"/api/halls/[id]/report",filename:"route",bundlePath:"app/api/halls/[id]/report/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Volumes/Drive 1/hostel management software/src/app/api/halls/[id]/report/route.ts",nextConfigOutput:"",userland:()=>c(7177),...{}}),{workAsyncStorage:w,workUnitAsyncStorage:x,serverHooks:y}=v;function z(){return(0,f.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:x})}async function A(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),v.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/halls/[id]/report/route";"/index"===d&&(d="/");let f=await v.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:w,deploymentId:x,params:y,nextConfig:z,parsedUrl:A,isDraftMode:B,prerenderManifest:C,routerServerContext:D,isOnDemandRevalidate:E,revalidateOnlyGenerated:F,resolvedPathname:G,clientReferenceManifest:H,serverActionsManifest:I,previewProps:J}=f,K=(0,j.normalizeAppPath)(d),L=!!C.routes[G]&&(v.isDev||(0,t.isRouteCacheOwner)(G,v.cacheOwner,C.routes[G])),M=!!(C.dynamicRoutes[K]||L),N=async()=>((null==D?void 0:D.render404)?await D.render404(a,b,A,!1):b.end("This page could not be found"),null);if(M&&!B){let a=C.dynamicRoutes[K];if(a&&!1===a.fallback&&!L){if(z.adapterPath)return await N();throw new s.NoFallbackError}}let O=null;!M||v.isDev||B||(O="/index"===(O=G)?"/":O),I&&H&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:H,serverActionsManifest:I});let P=a.method||"GET",Q=(0,h.getTracer)(),R=Q.getActiveScopeSpan(),S=!!(null==D?void 0:D.isWrappedByNextServer),T=!!(0,g.getRequestMeta)(a,"minimalMode"),U=(0,g.getRequestMeta)(a,"incrementalCache")||await v.getIncrementalCache(a,z,J,C,T);null==U||U.resetRequestCache(),globalThis.__incrementalCache=U;let V={params:y,previewProps:J,renderOpts:{experimental:{authInterrupts:!!z.experimental.authInterrupts,useCacheTimeout:z.experimental.useCacheTimeout,durableUseCacheEntries:!!z.experimental.durableUseCacheEntries},cacheComponents:!!z.cacheComponents,validationLevel:z.experimental.instantInsights.validationLevel,isDraftMode:B,incrementalCache:U,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:z.cacheLife,staticPageGenerationTimeout:z.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0},sharedContext:{buildId:w,deploymentId:x}},W=new k.NodeNextRequest(a),X=new k.NodeNextResponse(b),Y=l.NextRequestAdapter.fromNodeNextRequest(W,(0,l.signalFromNodeResponse)(b)),Z=async({previousCacheEntry:e})=>{try{if(!T&&E&&F&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=null===O?await v.handle(Y,V):await v.prerender(Y,V);a.fetchMetrics=V.renderOpts.fetchMetrics;let f=V.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=V.renderOpts.collectedTags;if(!M)return await (0,o.I)(W,X,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==V.renderOpts.collectedRevalidate&&!(V.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&V.renderOpts.collectedRevalidate,e=void 0===V.renderOpts.collectedExpire||V.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?z.expireTime:void 0:V.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await v.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:null!==O,isOnDemandRevalidate:E})},!1,D),b}},$=async(d,f)=>{try{var g,i;let d=await v.handleResponse({req:a,nextConfig:z,cacheKey:O,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,previewProps:J,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:E,revalidateOnlyGenerated:F,responseGenerator:Z,waitUntil:c.waitUntil,isMinimalMode:T});if(null!==d&&"error"in d)throw d.error;if(!M)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==u.CachedRouteKind.APP_ROUTE)throw Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`);T||b.setHeader("x-nextjs-cache",E?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),B&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);T&&M||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(W,X,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(c){if(c instanceof s.NoFallbackError||await v.onRequestError(a,c,{routerKind:"App Router",routePath:K,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:null!==O,isOnDemandRevalidate:E})},!1,D),M)throw c;if(b.headersSent){if(d){let a=c instanceof Error?c:Error("Unknown app route error");d.recordException(a),d.setStatus({code:h.SpanStatusCode.ERROR,message:a.message}),d.setAttribute("error.type",a.name)}b.writableEnded||b.destroyed||b.end()}else await (0,o.I)(W,X,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=Q.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||K,g=`${P} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(S&&R)await $(R,void 0);else{let b=Q.getActiveScopeSpan();await Q.withPropagatedContext(a.headers,()=>Q.trace(m.BaseServerSpan.handleRequest,{spanName:`${P} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":P,"http.target":a.url}},a=>$(a,b)),void 0,!S)}}},7177:(a,b,c)=>{"use strict";c.r(b),c.d(b,{GET:()=>f});var d=c(3211),e=c(866);async function f(a){try{let b=new URL(a.url),c=b.pathname.match(/\/api\/halls\/(\d+)\/report/);if(!c)return d.NextResponse.json({success:!1,error:"Invalid request"},{status:400});let f=parseInt(c[1],10),g=b.searchParams.get("month");if(!g)return d.NextResponse.json({success:!1,error:"Missing month query parameter (YYYY-MM)"},{status:400});if(!/^\d{4}-\d{2}$/.test(g))return d.NextResponse.json({success:!1,error:"Invalid month format. Use YYYY-MM"},{status:400});let h=e.A.prepare(`SELECT h.*, m.name as manager_name FROM halls h
         LEFT JOIN managers m ON m.hall_id = h.id
         WHERE h.id = ?`).get(f);if(!h)return d.NextResponse.json({success:!1,error:"Hall not found"},{status:404});let i=e.A.prepare("SELECT COUNT(*) as cnt FROM students WHERE hall_id = ?").get(f).cnt,j=e.A.prepare(`SELECT d.*, (d.amount - COALESCE(d.paid_amount, 0)) as remaining_amount,
                s.name as student_name, s.student_id as student_code, s.room_number
         FROM dues d
         JOIN students s ON s.id = d.student_id
         WHERE s.hall_id = ? AND strftime('%Y-%m', d.created_at) = ?
         ORDER BY d.id DESC`).all(f,g),k=e.A.prepare(`SELECT p.*, s.name as student_name, s.student_id as student_code, s.room_number
         FROM payments p
         JOIN students s ON s.id = p.student_id
         WHERE s.hall_id = ? AND strftime('%Y-%m', p.paid_at) = ?
         ORDER BY p.paid_at DESC, p.id DESC`).all(f,g),l=e.A.prepare(`SELECT COUNT(DISTINCT p.student_id) as cnt FROM payments p
         JOIN students s ON s.id = p.student_id
         WHERE s.hall_id = ? AND strftime('%Y-%m', p.paid_at) = ?`).get(f,g).cnt,m=j.reduce((a,b)=>a+(b.remaining_amount??b.amount-(b.paid_amount||0)),0),n=j.reduce((a,b)=>a+b.amount,0),o=k.reduce((a,b)=>a+b.amount_paid,0);return d.NextResponse.json({success:!0,hall:h,month:g,dues:j,payments:k,summary:{totalStudents:i,paidStudentsCount:l,pendingStudentsCount:Math.max(i-l,0),totalDueAmount:m,totalDueBilled:n,totalCollected:o,dueCount:j.length,paymentCount:k.length},generatedAt:new Date().toISOString()})}catch(a){return console.error("Report generation error:",a),d.NextResponse.json({success:!1,error:a.message},{status:500})}}},8128:a=>{"use strict";a.exports=require("next/dist/server/runtime-reacts.external.js")},8335:()=>{},9121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[266,813],()=>b(b.s=6926));module.exports=c})();