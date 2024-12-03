const formatName = (name: string): string => name.replace(/\b\w/g, (char) => char.toUpperCase())

export { formatName }
