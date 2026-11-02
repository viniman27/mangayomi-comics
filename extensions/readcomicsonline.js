// ReadComicsOnline.ru — not ReadComicOnline.li.
// Protocol/selector reference: Keiyoushi extensions-source (Apache-2.0).
const mangayomiSources = [{
  name: 'ReadComicsOnline', lang: 'en', baseUrl: 'https://readcomicsonline.ru',
  apiUrl: '', iconUrl: 'https://readcomicsonline.ru/favicon.ico',
  typeSource: 'single', isManga: true, itemType: 0,
  isNsfw: true, hasCloudflare: true, version: '1.0.0',
  dateFormat: '', dateFormatLocale: '',
  pkgPath: 'manga/src/en/readcomicsonline.js', sourceCodeLanguage: 1
}];
class DefaultExtension extends MProvider {
  getHeaders(url) { return {Referer: this.source.baseUrl + '/'}; }
  absolute(value) {
    const text = (value || '').trim();
    if (!text) return '';
    if (/^https?:\/\//i.test(text)) return text;
    if (text.startsWith('//')) return 'https:' + text;
    return this.source.baseUrl + '/' + text.replace(/^\/+/, '');
  }
  async document(url) {
    const response = await new Client().get(url, this.getHeaders(url));
    const body = response.body || '';
    if (response.statusCode === 403 || /cdn-cgi\/challenge-platform|<title>[^<]*(?:Just a moment|Um momento)/i.test(body)) throw new Error('ReadComicsOnline: Cloudflare blocked access. Open the source in Mangayomi WebView, complete the check and retry.');
    if (response.statusCode >= 400) throw new Error('ReadComicsOnline: HTTP ' + response.statusCode);
    return new Document(body);
  }
  async catalog(page, sort) {
    const doc = await this.document(this.source.baseUrl + '/comic-list?sort=' + sort + '&page=' + page);
    if (!doc.select('div.comic-list-layout').length) throw new Error('ReadComicsOnline: unrecognized catalog layout.');
    const list = [];
    for (const entry of doc.select('div.comic-list-layout .grid > .group')) {
      const a = entry.selectFirst('a.block.text-sm.font-semibold');
      if (!a.getHref || !a.text.trim()) continue;
      list.push({name:a.text.trim(), link:this.absolute(a.getHref), imageUrl:this.cover(a.getHref, this.image(entry.selectFirst('img')))});
    }
    return {list, hasNextPage:doc.select('nav a[rel=next]').length > 0};
  }
  cover(url, image) {
    if (image && !image.endsWith('no-image.png')) return image;
    const slug = url.split('?')[0].replace(/\/$/, '').split('/').pop();
    return this.absolute('/uploads/manga/' + slug + '/cover/cover_250x350.jpg');
  }
  image(element) {
    for (const attribute of ['data-background-image', 'data-cfsrc', 'data-lazy-src', 'data-src', 'src']) {
      const value = element.attr(attribute);
      if (value && !value.startsWith('data:')) return this.absolute(value);
    }
    return '';
  }
  async getDetail(url) {
    const link = this.absolute(url);
    const doc = await this.document(link);
    const name = doc.selectFirst('h1.text-2xl').text.trim();
    if (!name) throw new Error('ReadComicsOnline: title not found. Open the title in WebView.');
    const state = doc.selectFirst('div.flex.flex-wrap.gap-2 span.rounded-full').text.trim().toLowerCase();
    const chapters = doc.select('.overflow-hidden.border-ink-600 > a').filter(a => a.getHref).map(a => {
      const dateText = a.selectFirst('.text-slate-500').text.trim();
      const parts = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/.exec(dateText);
      const month = parts ? ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(parts[2].toLowerCase()) : -1;
      const dateUpload = parts && month >= 0 ? String(Date.UTC(Number(parts[3]), month, Number(parts[1]))) : '';
      return {name:a.selectFirst('.text-brand-400').text.trim() || a.text.trim(), url:this.absolute(a.getHref), dateUpload};
    });
    return {name,link,imageUrl:this.cover(link, this.image(doc.selectFirst('img.w-full.rounded-xl'))),
      description:doc.selectFirst('div:has(> div > h3:contains(Synopsis)) > div > p').text.trim(),
      author:doc.select('div:has(span:contains(Author:)) > a').map(a=>a.text.trim()).join(', '),
      genre:doc.select('dl div:contains(Genres:) a').map(a=>a.text.trim()),
      status:['complete','completed'].includes(state) ? 1 : state === 'ongoing' ? 0 : state === 'dropped' ? 3 : 5,
      chapters};
  }
  async getPageList(url) {
    const doc = await this.document(this.absolute(url));
    const pages = doc.select('#reader-all img').map(img => this.image(img)).filter(Boolean);
    if (!pages.length) throw new Error('ReadComicsOnline: chapter images not found. Open the chapter in WebView.');
    return pages;
  }
  getFilterList() { return []; }
  getSourcePreferences() { return []; }
  get supportsLatest() { return true; }
  async getLatestUpdates(page) { return this.catalog(page, 'latest'); }
  async search(query, page, filters) {
    if (!query.trim()) return this.getPopular(page);
    const doc = await this.document(this.source.baseUrl + '/advanced-search?name=' + encodeURIComponent(query.trim()) + '&page=' + page);
    const list = [];
    for (const a of doc.select('div a')) {
      const img = a.selectFirst('img');
      const name = a.selectFirst('p').text.trim();
      if (!img.getSrc || !name || !a.getHref) continue;
      const link = this.absolute(a.getHref);
      if (!list.some(item => item.link === link)) list.push({name, link, imageUrl: this.absolute(img.getSrc)});
    }
    return {list, hasNextPage:doc.select('span a[rel=next]').length > 0};
  }
  async getPopular(page) { return this.catalog(page, 'views'); }
}
