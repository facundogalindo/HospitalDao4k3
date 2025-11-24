class EventManager:
    def __init__(self):
        self.listeners = {}

    def subscribe(self, event_type: str, listener):
        """Registra un observador a un evento."""
        self.listeners.setdefault(event_type, []).append(listener)

    def notify(self, event_type: str, data):
        """Notifica a todos los observadores."""
        for listener in self.listeners.get(event_type, []):
            listener.update(data)


# Instancia global que usará todo el sistema
event_manager = EventManager()