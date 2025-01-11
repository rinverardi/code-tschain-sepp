function filterId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "");
}

export function inputId(id: string): string {
  return filterId(id);
}

export function outputId(id: string): string {
  id = filterId(id);

  return id.length > 10 ? `${id.slice(0, 4)}..${id.slice(-4)}` : id;
}

export function outputIdOr(id: string, value: string): string {
  return id ? outputId(id) : value;
}
