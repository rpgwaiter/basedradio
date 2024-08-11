// Helper Functions

export function makeDraggable (element) {
  // console.log(Object.keys(element))
  // console.log(element)
  // Make an element draggable (or if it has a .window-top class, drag based on the .window-top element)
  let currentPosX = 0; let currentPosY = 0; let previousPosX = 0; let previousPosY = 0

  const header = element.querySelector('.header')
  const b = element.querySelector('.player-minimize')

  console.log(b)

  // If there is a window-top classed element, attach to that element instead of full window
  if (header) {
    // If present, the window-top element is where you move the parent element from
    header.onmousedown = dragMouseDown
  } else {
    // Otherwise, move the element itself
    element.onmousedown = dragMouseDown
  }

  function dragMouseDown (e) {
    e.preventDefault()
    // Get the mouse cursor position and set the initial previous positions to begin
    previousPosX = e.clientX
    previousPosY = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  function elementDrag (e) {
    // Prevent any default action on this element (you can remove if you need this element to perform its default action)
    e.preventDefault()
    // Calculate the new cursor position by using the previous x and y positions of the mouse
    currentPosX = previousPosX - e.clientX
    currentPosY = previousPosY - e.clientY
    // Replace the previous positions with the new x and y positions of the mouse
    previousPosX = e.clientX
    previousPosY = e.clientY
    // Set the element's new position
    element.style.top = (element.offsetTop - currentPosY) + 'px'
    element.style.left = (element.offsetLeft - currentPosX) + 'px'
  }

  function closeDragElement () {
    // Stop moving when mouse button is released and release events
    document.onmouseup = null
    document.onmousemove = null
  }
}

export function formatTime (e) {
  e = Number(e) || 0
  const min = addZeros(Math.floor((e % 3600) / 60), 2)
  const sec = addZeros(Math.floor((e % 3600) % 60), 2)
  return `${min}:${sec}`
}

// Adds zeroes in front of number (e) until e.len = t
export function addZeros (e, t) {
  for (var n = e.toString(); n.length < t;) n = '0' + n
  return n
}

