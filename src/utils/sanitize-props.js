import assign from './assign';

export default function sanitizeProps(props, propTypes) {
  let sanitizedProps = assign({}, props);
  for (let prop in propTypes) {
    if (propTypes.hasOwnProperty(prop)) {
      delete sanitizedProps[prop];
    }
  }

  return sanitizedProps;
}
