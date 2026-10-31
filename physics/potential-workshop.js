/* کارگاه تعاملی اختلاف پتانسیل — مسائل بازنویسی‌شده و تألیفی، با حفظ منبع. */
const workshopSources={
 physicfa:'https://physicfa.ir/%D8%A7%D9%86%D8%B1%DA%98%DB%8C-%D9%BE%D8%AA%D8%A7%D9%86%D8%B3%DB%8C%D9%84-%D8%A7%D9%84%DA%A9%D8%AA%D8%B1%DB%8C%DA%A9%DB%8C/',
 textbook:'https://magerta.ir/news/scientific/answer-page-41-42-43-44-of-11th-grade-mathematics-physics-book/',
 gozine:'https://mag.gozine2.ir/%D8%A7%D8%AE%D8%AA%D9%84%D8%A7%D9%81-%D9%BE%D8%AA%D8%A7%D9%86%D8%B3%DB%8C%D9%84-%D8%AF%D8%B1-%D9%85%DB%8C%D8%AF%D8%A7%D9%86-%DB%8C%DA%A9%D9%86%D9%88%D8%A7%D8%AE%D8%AA/'
};
const workshopProblems=[
{id:'sign-a',category:'پتانسیل و انرژی',level:'آسان',title:'بار منفی و دو پتانسیل منفی',statement:'بار −۳ nC از پتانسیل −۲۰ V به +۱۰ V منتقل می‌شود.',steps:[
{q:'ΔV = V نهایی − V اولیه چند ولت است؟',answer:30,hints:['ابتدا −۲۰ را داخل پرانتز بگذار.','۱۰−(−۲۰) را حساب کن.'],explain:'ΔV=۱۰−(−۲۰)=+۳۰ V.'},
{q:'تغییر انرژی پتانسیل چند نانوژول است؟ علامت را بنویس.',answer:-90,hints:['از ΔU=qΔV استفاده کن؛ علامت بار را حذف نکن.','یک nC ضربدر یک V برابر یک nJ است.'],explain:'ΔU=(−۳ nC)(+۳۰ V)=−۹۰ nJ؛ انرژی کاهش یافته است.'},
{q:'کار میدان چند نانوژول است؟',answer:90,hints:['کار میدان قرینهٔ تغییر انرژی پتانسیل است.'],explain:'W_E=−ΔU=+۹۰ nJ.'}]},
{id:'sign-b',category:'پتانسیل و انرژی',level:'متوسط',title:'بار منفی از پتانسیل بیشتر به کمتر',source:'physicfa',sourceLabel:'بازنویسی تمرین ۲ فیزیکفا؛ محاسبهٔ مراحل به‌طور مستقل',statement:'بار −۵ µC از نقطهٔ A با پتانسیل +۲ V به نقطهٔ B با پتانسیل −۴ V منتقل می‌شود. فرض کن میدان الکتروستاتیکی است.',steps:[
{q:'V_B−V_A چند ولت است؟',answer:-6,hints:['پتانسیل نهایی منهای اولیه را بنویس.'],explain:'ΔV=−۴−۲=−۶ V.'},
{q:'ΔU چند میکروژول است؟',answer:30,hints:['علامت q و علامت ΔV را با هم ضرب کن.','یک µC ضربدر یک V برابر یک µJ است.'],explain:'ΔU=(−۵)(−۶)=+۳۰ µJ؛ انرژی افزایش می‌یابد.'},
{q:'کار میدان در مسیر A به B چند میکروژول است؟',answer:-30,hints:['W میدان برابر منفی ΔU است.'],explain:'W_E=−۳۰ µJ.'}]},
{id:'reverse-voltage',category:'پتانسیل و انرژی',level:'متوسط',title:'از کار میدان تا پتانسیل پایانی',source:'physicfa',sourceLabel:'بازنویسی تمرین ۶ فیزیکفا؛ حل و مراحل مستقل',statement:'بار −۴ µC از A با پتانسیل +۵ V به B می‌رود و کار میدان +۸۰ µJ است.',steps:[
{q:'ΔU چند میکروژول است؟',answer:-80,hints:['تغییر انرژی پتانسیل قرینهٔ کار میدان است.'],explain:'ΔU=−۸۰ µJ.'},
{q:'V_B−V_A چند ولت است؟',answer:20,hints:['ΔV=ΔU/q را با علامت‌ها حساب کن.'],explain:'ΔV=(−۸۰ µJ)/(−۴ µC)=+۲۰ V.'},
{q:'پتانسیل B چند ولت است؟',answer:25,hints:['V_B=V_A+ΔV.'],explain:'V_B=۵+۲۰=۲۵ V.'}]},
{id:'battery-reference',category:'باتری و مرجع',level:'آسان',title:'مرجع پایانهٔ مثبت',statement:'اختلاف پتانسیل دو سر یک باتری ۲۴ V است و پایانهٔ مثبت مرجع صفر در نظر گرفته می‌شود.',steps:[
{q:'پتانسیل پایانهٔ منفی چند V است؟',answer:-24,hints:['V باتری برابر V مثبت منهای V منفی است.','۲۴=۰−V منفی.'],explain:'V منفی=−۲۴ V.'},
{q:'از پایانهٔ مثبت به منفی، ΔV چند V است؟',answer:-24,hints:['در این مسیر پایانهٔ منفی نقطهٔ نهایی است.'],explain:'ΔV=V منفی−V مثبت=−۲۴ V.'}]},
{id:'battery-shift',category:'باتری و مرجع',level:'متوسط',title:'تغییر مرجع و تغییرناپذیری اختلاف',statement:'در یک باتری ۱۲ V، پتانسیل پایانهٔ منفی ابتدا −۸ V است. سپس به هر دو پتانسیل ۲۰ V اضافه می‌کنیم.',steps:[
{q:'پتانسیل اولیهٔ پایانهٔ مثبت چند V است؟',answer:4,hints:['۱۲=V مثبت−(−۸).'],explain:'V مثبت=۴ V.'},
{q:'پتانسیل جدید پایانهٔ مثبت چند V است؟',answer:24,hints:['به مقدار قبلی ۲۰ V اضافه کن.'],explain:'۴+۲۰=۲۴ V.'},
{q:'در مرجع جدید اختلاف پتانسیل مثبت منهای منفی چند V است؟',answer:12,hints:['پایانهٔ منفی جدید −۸+۲۰ است.'],explain:'۲۴−۱۲=۱۲ V؛ اختلاف تغییر نمی‌کند.'}]},
{id:'battery-charge',category:'باتری و مرجع',level:'متوسط',title:'انرژی و مسیر قراردادی دو پایانه',statement:'اختلاف ترمینالی باتری ۹ V است. بار +۴ µC بین دو نقطهٔ هم‌پتانسیل با پایانهٔ منفی و مثبت به ترتیب جابه‌جا می‌شود؛ میدان در ناحیهٔ جابه‌جایی الکتروستاتیکی است.',steps:[
{q:'ΔV از سمت منفی به مثبت چند V است؟',answer:9,hints:['مثبت منهای منفی طبق قرارداد ولتاژ باتری است.'],explain:'ΔV=+۹ V.'},
{q:'ΔU بار چند µJ است؟',answer:36,hints:['qΔV را با علامت بار حساب کن.'],explain:'ΔU=۴×۹=+۳۶ µJ.'},
{q:'کار میدان الکتروستاتیکی در این جابه‌جایی چند µJ است؟',answer:-36,hints:['کار میدان قرینهٔ ΔU است؛ آن را با کار شیمیایی درون باتری یکی نگیر.'],explain:'W_E=−۳۶ µJ؛ نیروهای غیرالکتروستاتیکیِ درون باتری جداگانه بررسی می‌شوند.'}]},
{id:'plate-field',category:'میدان یکنواخت',level:'متوسط',title:'صفحه‌های موازی و بار منفی',source:'textbook',sourceLabel:'داده‌های اختلاف پتانسیل و فاصله برگرفته از مسئلهٔ ۱۹ کتاب در ماگرتا؛ بخش بار منفی افزوده شده است',statement:'دو صفحهٔ بزرگ ۲ cm فاصله و ۱۰۰ V اختلاف پتانسیل دارند. از اثر لبه صرف‌نظر کن. بار −۲ µC از صفحهٔ با پتانسیل بالاتر به صفحهٔ پایین‌تر برده می‌شود.',steps:[
{q:'اندازهٔ میدان چند V/m است؟',answer:5000,hints:['۲ cm برابر ۰٫۰۲ m است.','E=|ΔV|/d.'],explain:'E=۱۰۰/۰٫۰۲=۵۰۰۰ V/m.'},
{q:'ΔV در مسیر گفته‌شده چند V است؟',answer:-100,hints:['نهایی کم‌پتانسیل‌تر از اولیه است.'],explain:'ΔV=−۱۰۰ V.'},
{q:'ΔU بار چند µJ است؟',answer:200,hints:['دو علامت منفی را در qΔV نگه دار.'],explain:'ΔU=(−۲ µC)(−۱۰۰ V)=+۲۰۰ µJ.'},
{q:'کار میدان چند µJ است؟',answer:-200,hints:['کار میدان قرینهٔ ΔU است.'],explain:'W_E=−۲۰۰ µJ.'}]},
{id:'angle-field',category:'میدان یکنواخت',level:'دشوار',title:'جابه‌جایی زاویه‌دار',statement:'میدان یکنواخت ۵۰۰ V/m است. جابه‌جایی ۱۰ cm با میدان زاویهٔ ۶۰ درجه دارد؛ cos۶۰°=۰٫۵.',steps:[
{q:'مؤلفهٔ جابه‌جایی در راستای میدان چند متر است؟',answer:.05,hints:['۱۰ cm را به ۰٫۱۰ m تبدیل کن.','d cos۶۰° را به دست آور.'],explain:'d∥=۰٫۱۰×۰٫۵=۰٫۰۵ m.'},
{q:'V نهایی منهای اولیه چند V است؟',answer:-25,hints:['ΔV=−E d∥ است.'],explain:'ΔV=−۵۰۰×۰٫۰۵=−۲۵ V.'},
{q:'اگر همین جابه‌جایی عمود بر میدان باشد، ΔV چند V است؟',answer:0,hints:['مؤلفهٔ موازی میدان صفر است.'],explain:'ΔV=۰ V.'}]},
{id:'field-map',category:'میدان یکنواخت',level:'متوسط',title:'پتانسیل روی خط و عمود بر میدان',source:'gozine',sourceLabel:'الهام از مثال هم‌پتانسیلی در میدان یکنواخت گزینهٔ دو؛ داده‌ها تألیفی‌اند',statement:'میدان یکنواخت ۲۰۰ V/m به راست است. V_A=۵۰ V. نقطهٔ B در ۲۰ cm سمت راست A و نقطهٔ C در ۱۵ cm بالای B است.',steps:[
{q:'V_B−V_A چند V است؟',answer:-40,hints:['تبدیل کن و از ΔV=−Ed برای حرکت هم‌جهت میدان استفاده کن.'],explain:'ΔV_AB=−۲۰۰×۰٫۲۰=−۴۰ V.'},
{q:'پتانسیل B چند V است؟',answer:10,hints:['اختلاف پتانسیل را به V_A اضافه کن.'],explain:'V_B=۵۰−۴۰=۱۰ V.'},
{q:'پتانسیل C چند V است؟',answer:10,hints:['حرکت از B به C عمود بر میدان است.'],explain:'ΔV_BC=۰؛ پس V_C=V_B=۱۰ V.'}]},
{id:'work-same',category:'کار و انرژی جنبشی',level:'متوسط',title:'تندی‌های ابتدا و انتها برابر',statement:'بار −۳ µC از A به B با ΔV=+۴۰ V می‌رود. تندی‌ها در ابتدا و انتها برابرند و فقط میدان و نیروی خارجی کار می‌کنند.',steps:[
{q:'ΔU چند µJ است؟',answer:-120,hints:['ΔU=qΔV و بار منفی است.'],explain:'ΔU=−۳×۴۰=−۱۲۰ µJ.'},
{q:'کار میدان چند µJ است؟',answer:120,hints:['کار میدان منفی ΔU است.'],explain:'W_E=+۱۲۰ µJ.'},
{q:'کار نیروی خارجی چند µJ است؟',answer:-120,hints:['تندی‌های برابر یعنی ΔK=۰.','مجموع کار میدان و خارجی صفر است.'],explain:'W_out=−۱۲۰ µJ.'}]},
{id:'work-changing',category:'کار و انرژی جنبشی',level:'دشوار',title:'انرژی جنبشی متغیر',statement:'بار +۲ µC در اختلاف پتانسیل +۳۰ V جابه‌جا می‌شود. کار نیروی خارجی +۱۰۰ µJ است؛ نیروی دیگری کار نمی‌کند.',steps:[
{q:'کار میدان چند µJ است؟',answer:-60,hints:['ابتدا qΔV را حساب و علامت آن را برعکس کن.'],explain:'W_E=−(۲×۳۰)=−۶۰ µJ.'},
{q:'تغییر انرژی جنبشی چند µJ است؟',answer:40,hints:['کارهای میدان و خارجی را با علامت جمع کن.'],explain:'ΔK=۱۰۰−۶۰=+۴۰ µJ.'},
{q:'اگر انرژی جنبشی اولیه ۲۰ µJ باشد، انرژی جنبشی نهایی چند µJ است؟',answer:60,hints:['K نهایی = K اولیه + ΔK.'],explain:'K₂=۲۰+۴۰=۶۰ µJ.'}]},
{id:'work-other',category:'کار و انرژی جنبشی',level:'دشوار',title:'وقتی نیروی دیگری هم کار می‌کند',statement:'کار میدان +۸ mJ، کار نیروی خارجی +۲ mJ و کار اصطکاک −۳ mJ است.',steps:[
{q:'کار خالص همهٔ نیروها چند mJ است؟',answer:7,hints:['هر سه کار را با علامت جمع کن.'],explain:'W خالص=۸+۲−۳=۷ mJ.'},
{q:'تغییر انرژی جنبشی چند mJ است؟',answer:7,hints:['قضیهٔ کار و انرژی را برای کار خالص به کار ببر.'],explain:'ΔK=+۷ mJ.'},
{q:'تغییر انرژی پتانسیل الکتریکی چند mJ است؟',answer:-8,hints:['برای ΔU الکتریکی فقط کار میدان الکتریکی را استفاده کن.'],explain:'ΔU_E=−W_E=−۸ mJ، نه قرینهٔ کار کل.'}]}
];
function workshopPage(id){
 const problem=workshopProblems.find(p=>p.id===id);if(!id)return `${header('کارگاه پتانسیل و کار','۱۲ مسئلهٔ چندمرحله‌ای، از آسان تا دشوار؛ هر بار یک گام')}<div class="course-intro"><span>✎</span><div><b>اول خودت فکر کن</b><p>راهنمایی‌ها تدریجی‌اند. پاسخ کامل هر گام فقط با درخواست تو نمایش داده می‌شود. مسئله‌ها انتخابی‌اند و بعد از پایان هیچ مسئله‌ای خودکار شروع نمی‌شود.</p></div></div><div class="all-lessons">${workshopProblems.map((p,i)=>`<a class="course-card" href="#/workshop/${p.id}"><div class="course-top"><span class="course-icon">${fa(i+1)}</span><span class="row-status">${p.level}</span></div><h3>${p.title}</h3><p>${p.category} · ${fa(p.steps.length)} گام ${p.source?'· با ارجاع به منبع':''}</p><div class="course-foot"><span>${state.workshop?.[p.id]?.index>=p.steps.length?'انجام شده':'تمرین انتخابی'}</span><span>باز کردن مسئله ←</span></div></a>`).join('')}</div>`;
 if(!problem)return `${header('مسئله پیدا نشد','از فهرست کارگاه یک مسئله انتخاب کن.')}<a class="outline-btn" href="#/workshop">فهرست مسئله‌ها</a>`;
 return `${header(problem.title,problem.category+' · '+problem.level)}<a href="#/workshop" class="back-link">→ بازگشت به فهرست مسئله‌ها</a><div class="content-card"><div class="example-box"><b>صورت مسئله</b><p>${problem.statement}</p>${problem.source?`<small>${problem.sourceLabel}: <a href="${workshopSources[problem.source]}" target="_blank" rel="noopener noreferrer">مشاهدهٔ منبع</a></small>`:'<small>مسئلهٔ تألیفی</small>'}</div><div id="workshopArea"></div><button class="outline-btn" id="resetWorkshop" type="button">شروع دوبارهٔ همین مسئله</button></div>`;
}
function bindWorkshop(id){
 const problem=workshopProblems.find(p=>p.id===id);if(!problem)return;state.workshop=state.workshop||{};let run=state.workshop[id]||{index:0,hints:0,reveals:0,wrong:0};state.workshop[id]=run;
 const area=document.getElementById('workshopArea');document.getElementById('resetWorkshop').onclick=()=>{state.workshop[id]={index:0,hints:0,reveals:0,wrong:0};save();bindWorkshop(id)};
 function draw(){if(run.index>=problem.steps.length){area.innerHTML=`<div class="completion"><b>مسئله پایان یافت.</b> ${run.reveals?'در این نوبت '+fa(run.reveals)+' پاسخ را با درخواست خودت دیدی.':run.hints?'مسئله را با راهنمایی به پایان رساندی.':'مسئله را بدون درخواست راهنمایی به پایان رساندی.'}</div><p>هر زمان خواستی یک مسئلهٔ تازه را خودت از فهرست انتخاب کن.</p><a class="outline-btn" href="#/workshop">انتخاب مسئلهٔ دیگر ←</a>`;return}
 const item=problem.steps[run.index];area.innerHTML=exerciseUI(item,run.index,problem.steps.length);let hint=0,locked=false;const check=area.querySelector('#checkAnswer'),hintButton=area.querySelector('#hintButton'),feedback=area.querySelector('#feedback');hintButton.textContent='💡 راهنمایی کوچک';hintButton.onclick=()=>{if(locked)return;if(hint<item.hints.length){let h=document.createElement('div');h.className='hint';h.textContent=item.hints[hint++];area.querySelector('#hints').append(h);run.hints++;save()}else hintButton.textContent='راهنمای بیشتری نداریم؛ دوباره تلاش کن.'};let reveal=document.createElement('button');reveal.type='button';reveal.className='hint-btn reveal-btn';reveal.textContent='پاسخ همین گام را نشانم بده';hintButton.after(reveal);
 function finish(revealed){if(locked)return;locked=true;if(revealed)run.reveals++;feedback.className='feedback '+(revealed?'explanation':'success');feedback.textContent=(revealed?'توضیح: ':'درست است! ')+item.explain;check.disabled=true;hintButton.disabled=true;reveal.disabled=true;let next=document.createElement('button');next.type='button';next.className='primary-btn';next.textContent=run.index===problem.steps.length-1?'ثبت پایان مسئله ✓':'گام بعدی ←';next.onclick=()=>{run.index++;save();draw();renderMath()};feedback.after(next);save()}
 reveal.onclick=()=>finish(true);check.onclick=()=>{if(locked)return;let raw=item.choices?area.querySelector('input[name="answer"]:checked')?.value:area.querySelector('#answerInput').value,ok=validAnswer(item,raw);if(ok===null){feedback.className='feedback error';feedback.textContent='اول پاسخت را وارد کن.'}else if(ok)finish(false);else{run.wrong++;save();feedback.className='feedback error';feedback.textContent='هنوز درست نیست؛ علامت، یکا و ترتیب را دوباره بررسی کن. در صورت نیاز راهنمایی بگیر.'}};const input=area.querySelector('#answerInput');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check.click()}};renderMath()}
 draw();
}
