import os
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, messaging


def _firebase_app():
    try:
        return firebase_admin.get_app()
    except ValueError:
        credentials_path = (
            os.getenv("FCM_SERVICE_ACCOUNT_FILE")
            or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        )
        if not credentials_path or not Path(credentials_path).is_file():
            raise RuntimeError(
                "FCM não configurado. Defina FCM_SERVICE_ACCOUNT_FILE "
                "com o caminho do JSON da conta de serviço Firebase."
            )

        options: dict[str, Any] = {}
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        if project_id:
            options["projectId"] = project_id

        return firebase_admin.initialize_app(
            credentials.Certificate(credentials_path),
            options=options or None,
        )


def send_fcm_message(
    token: str,
    title: str,
    body: str,
    data: dict[str, str] | None = None,
) -> str:
    """Envia uma notificação FCM HTTP v1 pelo SDK Admin no backend."""
    app = _firebase_app()
    message = messaging.Message(
        token=token,
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        android=messaging.AndroidConfig(priority="high"),
        apns=messaging.APNSConfig(
            headers={"apns-priority": "10"},
            payload=messaging.APNSPayload(
                aps=messaging.Aps(sound="default")
            ),
        ),
    )
    return messaging.send(message, app=app)
