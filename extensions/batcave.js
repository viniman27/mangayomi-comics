// BatCave adapter. Protocol reference: Keiyoushi extensions-source (Apache-2.0).
// This file is self-contained; no Node/npm dependencies are used in Mangayomi.
const mangayomiSources = [{
  name: 'BatCave', lang: 'en', baseUrl: 'https://batcave.biz', apiUrl: '',
  iconUrl: 'https://batcave.biz/favicon.ico', typeSource: 'single',
  isManga: true, itemType: 0, isNsfw: true, hasCloudflare: true,
  version: '1.0.0', dateFormat: '', dateFormatLocale: '',
  pkgPath: 'manga/src/en/batcave.js', sourceCodeLanguage: 1
}];

class DefaultExtension extends MProvider {
  getHeaders(url) { return {Referer: this.source.baseUrl + '/'}; }
  absolute(value) {
    const text = (value || '').trim();
    if (/^https?:\/\//i.test(text)) return text;
    if (text.startsWith('//')) return 'https:' + text;
    return this.source.baseUrl + '/' + text.replace(/^\/+/, '');
  }
  async request(url, body, json) {
    const headers = this.getHeaders(url);
    if (body !== undefined) headers['Content-Type'] = json ? 'application/json' : 'application/x-www-form-urlencoded';
    const client = new Client();
    const response = body === undefined ? await client.get(url, headers) : await client.post(url, headers, body);
    const bodyText = response.body || '';
    if (response.statusCode === 403 || /cdn-cgi\/challenge-platform|<title>[^<]*(?:Just a moment|Um momento)|dle_guard/i.test(bodyText)) {
      throw new Error('BatCave: Cloudflare/DLE Guard blocked access. Open the source in Mangayomi WebView, complete the check and retry.');
    }
    if (response.statusCode >= 400) throw new Error('BatCave: HTTP ' + response.statusCode);
    return bodyText;
  }
  parseList(html, page, latest) {
    const doc = new Document(html);
    if (!doc.select(latest ? '#content-load' : '#dle-content').length) throw new Error('BatCave: unrecognized catalog layout. Open the source in WebView.');
    const list = [];
    for (const entry of doc.select(latest ? '#content-load > .latest.grid-item' : '#dle-content > .readed')) {
      const anchor = entry.selectFirst(latest ? '.latest__title > a' : '.readed__title > a');
      if (!anchor || !anchor.text.trim() || !anchor.getHref) continue;
      const link = this.absolute(anchor.getHref);
      if (list.some(item => item.link === link)) continue;
      const id = link.match(/\/(\d+)-[^/]+\.html/);
      list.push({name: anchor.text.trim(), link, imageUrl: id ? this.absolute('/uploads/posts/hd/' + id[1] + '.webp') : ''});
    }
    const hasNextPage = doc.select('.pagination__pages a[href], li.pagination a[href]').some(a => {
      const match = a.getHref.match(/\/page\/(\d+)/);
      return match && Number(match[1]) > page;
    });
    return {list, hasNextPage};
  }
  field(doc, label) {
    for (const item of doc.select('.page__list > li')) {
      const heading = item.selectFirst('div');
      if (!heading || heading.text.trim().toLowerCase() !== label.toLowerCase()) continue;
      return item.text.replace(heading.text, '').trim();
    }
    return '';
  }
  chapterData(doc) {
    for (const script of doc.select('script')) {
      const raw = script.innerHtml;
      const match = /window\.__DATA__\s*=\s*/.exec(raw);
      if (!match) continue;
      const start = match.index + match[0].length;
      let depth = 0, quoted = false, escaped = false;
      for (let i = start; i < raw.length; i++) {
        const c = raw[i];
        if (quoted) {
          if (escaped) escaped = false;
          else if (c === '\\') escaped = true;
          else if (c === '"') quoted = false;
        } else if (c === '"') quoted = true;
        else if (c === '{') depth++;
        else if (c === '}' && --depth === 0) return JSON.parse(raw.slice(start, i + 1));
      }
    }
    throw new Error('BatCave: chapter data not found; open this title in WebView.');
  }
  async getDetail(url) {
    const link = this.absolute(url);
    const doc = new Document(await this.request(link));
    const data = this.chapterData(doc);
    const title = doc.selectFirst('header.page__header h1');
    const image = doc.selectFirst('div.page__poster img');
    const description = doc.selectFirst('div.page__text');
    const status = this.field(doc, 'Release type').toLowerCase();
    const chapters = (data.chapters || []).map(chapter => {
      const parts = (chapter.date || '').split('.').map(Number);
      const date = parts.length === 3 ? Date.UTC(parts[2], parts[1] - 1, parts[0]) : NaN;
      return {name: chapter.title, url: this.absolute('/reader/' + data.news_id + '/' + chapter.id + (data.xhash || '')), dateUpload: Number.isFinite(date) ? String(date) : ''};
    });
    return {name: title ? title.text.trim() : '', link,
      imageUrl: image.getSrc ? this.absolute(image.getSrc) : '',
      description: description ? description.text.trim() : '',
      author: this.field(doc, 'Writer'), artist: this.field(doc, 'Artist'),
      status: status === 'completed' ? 1 : status === 'ongoing' ? 0 : 5,
      genre: doc.select('div.page__tags a').map(a => a.text.trim()).concat(['Comic']), chapters};
  }
  async getPageList(url) {
    const match = url.match(/\/reader\/(\d+)\/(\d+)/);
    if (!match) throw new Error('BatCave: Invalid chapter URL.');
    const endpoint = this.absolute('/engine/ajax/controller.php?mod=api&action=reader/getChapterData');
    const data = JSON.parse(await this.request(endpoint, JSON.stringify({news_id: match[1], chapter_id: match[2]}), true));
    if (!data.data || !Array.isArray(data.data.images) || !data.data.images.length) throw new Error('BatCave: chapter images unavailable.');
    return data.data.images.map(image => this.absolute(image));
  }
  getFilterList() { return []; }
  getSourcePreferences() { return []; }
  get supportsLatest() { return true; }
  async getLatestUpdates(page) {
    const url = this.absolute('/' + (page > 1 ? 'page/' + page + '/' : ''));
    return this.parseList(await this.request(url), page, true);
  }
  async search(query, page, filters) {
    if (!query.trim()) return this.getPopular(page);
    const url = this.absolute('/search/' + encodeURIComponent(query.trim()) + '/' + (page > 1 ? 'page/' + page + '/' : ''));
    return this.parseList(await this.request(url), page);
  }
  async getPopular(page) {
    const url = this.absolute('/comix/' + (page > 1 ? 'page/' + page + '/' : ''));
    const body = 'dlenewssortby=rating&dledirection=desc&set_new_sort=dle_sort_cat_1&set_direction_sort=dle_direction_cat_1';
    return this.parseList(await this.request(url, body), page);
  }
}
