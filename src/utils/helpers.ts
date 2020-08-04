
export function ggID() {
    let id = 0;
    return function genId() {
      return id++;
    };
}

export function timeout(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export const noop = () => {};