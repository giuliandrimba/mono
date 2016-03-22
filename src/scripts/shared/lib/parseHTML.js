export default function(html) {
  let div = document.createElement('div');
  div.innerHTML = html;
  let elements = div.firstChild;
  return elements;
}