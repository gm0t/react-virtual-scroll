export default function sanitizeProps(props, propTypes) {
  let sanitizedProps = {...props};
  for (let prop in propTypes) {
    if (propTypes.hasOwnProperty(prop)) {
      delete sanitizedProps[prop];
    }
  }

  return sanitizedProps;
}
