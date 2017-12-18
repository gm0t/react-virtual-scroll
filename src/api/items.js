import { cloneElement } from 'react';

const getItemHeight = (cmp) => {
  if (cmp.type && cmp.type.HEIGHT) {
    let height = cmp.type.HEIGHT;
    return + (typeof(height) === 'function' ? height(cmp.props) : height);
  }

  if (cmp.props.style && cmp.props.style.height) {
    let height = cmp.props.height;
    if (~height.indexOf('px')) {
        return parseInt(height, 10);
    } else if (!isNaN(+height)) {
        return +height;
    }
  }

  // TODO: what should we do with such items?
  return 0;
};

export default class Items {
  constructor(children, itemHeight) {
    this.itemHeight = typeof(itemHeight) === 'number' ? itemHeight : 'auto';
    this.setChildren(children);
  }

  get(index) {
    return this.items[index];
  }

  setChildren(children) {
    this.items = children.map(el => ({cmp: el}));
    this._updateItemsPosition(0);
    this._calcPeakHeights();
  }

  updateItemHeight(index, height) {
    let item = this.items[index];
    if (!item || item.height === height) {
      return false
    }

    const {minHeight, maxHeight} = this;
    if (item.height === minHeight || item.height === maxHeight) {
      this._calcPeakHeights()
    } else {
      this.maxHeight = Math.max(this.maxHeight, height);
      this.minHeight = Math.min(this.minHeight, height);
    }

    this._updateItemsPosition(index);
    return true;
  }

  buildRange(currentPos, bufferSize, viewportHeight) {
    if (viewportHeight === 0) {
      return [0, 0, []];
    }

    let start = this.getIndexByPos(currentPos) - bufferSize,
      end = this.getIndexByPos(currentPos + viewportHeight) + bufferSize,
      range = [];

    start = Math.max(start, 0);
    end = Math.min(end, this.items.length);

    for (let i = start; i < end; i += 1) {
      range.push(this.items[i].cmp);
    }

    return [start, end, range];
  }

  getIndexByPos(pos) {
    return this.itemHeight === 'auto' ?
      this._getIndexByPosVariableHeight(pos)
      : this._getIndexByPosStaticHeight(pos);
  }

  _updateItemsPosition(start = 0) {
    const height = this.itemHeight;
    let items = this.items;
    if (!items.length) {
      this.totalHeight = 0;
      return;
    }

    let top = start ? items[start].top || 0 : 0,
      item;

    for (let i = start, l = items.length, props; i < l; i += 1) {
      item = items[i];
      item.height = height === 'auto' ? getItemHeight(item.cmp) : height;
      item.top = top;
      props = {...item.cmp.props};
      props.style = {...props.style};
      props.style.position = 'absolute';
      props.style.top = item.top;
      props.index = i;
      item.cmp = cloneElement(item.cmp, props);
      top += item.height;
    }

    this.totalHeight = top;
    return items;
  }

  _calcPeakHeights() {
    let min = Infinity, max = -Infinity, h;
    for (let items = this.items, i = 0, l = items.length; i < l; i += 1) {
      h = items[i].height;
      if (h < min) {
        min = h;
      }
      if (h > max) {
        max = h;
      }
    }

    this.minHeight = min;
    this.maxHeight = max;
  }

  _getIndexByPosVariableHeight(pos) {
    const {minHeight, maxHeight, items, totalHeight} = this;

    if (pos < minHeight) {
      return 0;
    } else if (pos > totalHeight - minHeight) {
      return items.length;
    }

    for (let i = Math.floor(pos / maxHeight), l = items.length; i < l; i += 1) {
      if (items[i].top > pos) {
        return Math.max(i - 1, 0);
      }
      i += 1;
    }

    return items.length - 1;
  }

  _getIndexByPosStaticHeight(pos) {
    return Math.min(Math.max(Math.floor(pos / this.itemHeight), 0), this.items.length);
  }
}