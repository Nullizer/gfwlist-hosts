import { isValid, parse } from 'psl'
import got from 'got'

const list_url = 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt'
const response = await got(list_url)
const decoded = Buffer.from(response.body, 'base64').toString()
const items = decoded.split('\n').filter(line => !(
  line.length === 0 ||
  line.startsWith('!') ||
  line.startsWith('@') ||
  line.startsWith('[') ||
  line.includes('.*')
)).map(line => {
  line = decodeURIComponent(line)
  ;['||', '|', 'http://', 'https://', '*', '.'].forEach(word => {
    if (line.startsWith(word)) line = line.replace(word, '')
  })
  return line.replace(/\*\//g, '/')
}).flatMap(line => {
  try {
    const url = new URL('http://' + line)
    if (isValid(url.host) || url.host === parse(url.host).tld) {
      return url.host
    } else {
      console.error('Invalid: ' + url.host)
    }
  } catch {
    console.error('Parse fail: ' + line)
  }
  return []
})
const hosts = Array.from(new Set(items)).sort()
console.log(hosts.join('\n'))
