var DomManipulator = (() => {
  // Polyfil Element.matches
  // https://developer.mozilla.org/en/docs/Web/API/Element/matches#Polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length
        while (--i >= 0 && matches.item(i) !== this) { }
        return i > -1
      }
  }

  let _getConditionalCallback = function (selector, callback) {
    return function (e) {
      if (!e.target) return
      if (!e.target.matches(selector) && !e.target.closest(selector)) return
      callback.apply(this, arguments)
    }
  }

  let _openPage = fileName => {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`pages/${fileName}`)
    })
  }

  return {
    displayPageData: htmlString => {
      document.body.classList.add('fade')
      document.body.innerHTML = htmlString
      document.body.classList.remove('fade')
    },
    addDynamicEventListener: (rootElement, eventType, selector, callback, options) =>
      rootElement.addEventListener(eventType, _getConditionalCallback(selector, callback), options),
    openPage: _openPage,
    updatePageTitle: i18nKey => document.title = `${chrome.i18n.getMessage('appName')} - ${chrome.i18n.getMessage(i18nKey)}`,

    /**
     * @param {String} htmlString: HTML representing a single element
     * @return {Element}
     */
    htmlStringToHtmlNode: htmlString => {
      let template = document.createElement('template')
      template.innerHTML = htmlString.trim()
      return template.content.firstChild
    },

    /**
     * @param {String} htmlString: HTML representing any number of sibling elements
     * @return {NodeList}
     */
    htmlStringToHtmlNodes: htmlString => {
      let template = document.createElement('template')
      template.innerHTML = htmlString
      return template.content.childNodes
    },

    insertBefore: (newNode, referenceNode) => {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
    }
  }
})()

export default DomManipulator
