class CustomEventManager {
  dispatch(eventType: string, data: Record<string, any>) {
    const event = new CustomEvent(eventType, {
      detail: {
        ...data,
      },
    });
    document.dispatchEvent(event);
  }
}

export default new CustomEventManager();
