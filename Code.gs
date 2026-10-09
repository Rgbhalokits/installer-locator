/** RGB Halo Kits public installer feed. Deploy as Web App, execute as Me, access Anyone. */
const DOC_ID = '1queaFWbbtxI_jPpRKXmacqwg21GznJ0Z8On_EWVLL-E';
function doGet(e) {
  const callback = (e && e.parameter && e.parameter.callback) || '';
  if (!/^RGBHaloInstallers\.receive$/.test(callback)) {
    return ContentService.createTextOutput('Use callback=RGBHaloInstallers.receive').setMimeType(ContentService.MimeType.TEXT);
  }
  try {
    const data = readInstallers_();
    return ContentService.createTextOutput(callback + '(' + JSON.stringify({ok:true,updated:new Date().toISOString(),installers:data}) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch(err) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify({ok:false,error:'Unable to load installer directory'}) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
function readInstallers_() {
  const doc = DocumentApp.openById(DOC_ID);
  const tabs = doc.getTabs();
  const records = [];
  tabs.forEach(tab => {
    const state = tab.getTitle();
    const text = tab.asDocumentTab().getBody().getText().replace(/\u000b/g,'\n');
    const blocks = text.split(/\n\s*\n+/);
    blocks.forEach(block => {
      const lines = block.split('\n').map(s=>s.trim()).filter(Boolean);
      if (lines.length < 2) return;
      const name = lines[0];
      const phoneLine = lines.find(s => /^(?:phone\s*:\s*)?[+()\d][\d()\s.+-]{6,}$/.test(s) || /^phone\s*:/i.test(s));
      const cityIdx = lines.findIndex(s=>/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/.test(s));
      if (cityIdx < 1) return;
      const city = lines[cityIdx];
      const address = lines.slice(1,cityIdx).join(', ');
      const phone = phoneLine ? phoneLine.replace(/^phone\s*:\s*/i,'') : '';
      records.push({name,address,city,state,phone});
    });
  });
  return records;
}
