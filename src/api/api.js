import Items from './items';

export default class VirtualScrollApi {
  constructor(params) {
    this.listeners = [];
    this.items = new Items([], params.itemHeight);
    this.viewportHeight = params.viewportHeight;
    this.bufferSize = params.bufferSize;
    this.currentPos = 0;
    this.updateVisibleRange();
  }

  listen = cb => {
    this.listeners.push(cb);
    return () => {
      this.listeners.splice(this.listeners.indexOf(cb), 1);
    }
  }

  updateVisibleRange(forced) {
    const {currentPos, bufferSize, viewportHeight} = this;
    const [start, end, range] = this.items.buildRange(currentPos, bufferSize, viewportHeight);
    const {currentRangeStart, currentRangeEnd} = this;
    if (!forced && currentRangeStart === start && currentRangeEnd === end) {
      return
    }

    this.currentRangeStart = start;
    this.currentRangeEnd = end;
    this.visibleRange = range;
    this.triggerChange();
  }

  setViewportHeight(height) {
    if (this.viewportHeight === height) {
      return;
    }
    this.viewportHeight = height;
    this.updateVisibleRange();
  }

  setPosition(pos) {
    const delta = Math.abs(this.currentPos - pos);
    if (delta < this.items.minHeight) {
      return
    }
    this.currentPos = pos;
    return this.updateVisibleRange()
  }

  setChildren(children) {
    this.items.setChildren(children);
    this.updateVisibleRange(true);
  }

  updateItemHeight(index, height) {
    if (this.items.updateItemHeight(index, height)) {
      this.updateVisibleRange(true)
    }
  }

  getState = () => {
    return {
      viewportHeight: this.viewportHeight,
      visibleRange: this.visibleRange,
      totalHeight: this.items.totalHeight
    }
  }

  triggerChange() {
    const listeners = this.listeners;
    const state = this.getState();
    let i = listeners.length;

    while (i--) {
      listeners[i](state);
    }
  }
}