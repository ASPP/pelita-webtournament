type Listener = (data: string) => void;

class EventBus {
  listeners = new Set<Listener>();

  emit(data: string) {
    for (const l of this.listeners) {
      l(data);
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

const globalForEventBus = globalThis as typeof globalThis & { __eventBus?: EventBus };
if (!globalForEventBus.__eventBus) {
  globalForEventBus.__eventBus = new EventBus();
  console.log('Gloabl EventBus initialized');
}

export const eventBus = globalForEventBus.__eventBus!;
