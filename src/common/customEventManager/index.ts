class CustomEventManager {
  dispatch(eventType: string, data: Record<string, unknown>) {
    const event = new CustomEvent(eventType, {
      detail: {
        ...data,
      },
    });
    document.dispatchEvent(event);
  }
}

export default new CustomEventManager();
