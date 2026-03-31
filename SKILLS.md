# 🧠 Extended Workflows & Operations

A guide setting up node connectors and mockup triggers.

---

## 🔁 Setup n8n / ActivePieces Connectors
This mockup app simulates backend response. When ready to go live, use these guides to connect to webhooks.

### 1. The Trigger
-   **Service**: Webhook (from Dashboard Lead Page Settings)
-   **Action**: `POST` to ingestion endpoint.
-   **Payload**:
    ```json
    {
      "name": "Lead Name",
      "phone": "+1234567890",
      "requested_service": "Tree Removal"
    }
    ```

### 2. The Responder (SMS)
-   **Connector**: Twilio OR Vonage.
-   **Flow**:
    -   Delay 10 seconds (Pacing realism).
    -   Type message: `Hi [Name], this is [Business] Support. We received your request about [Service]. A few quick questions – when are you looking to get this done?`

---

## 🛠 Adding New Mockup Data
To expand dashboards or demo flows, create modules inside `src/data/mock.js`.

**Format**:
```javascript
export const SAMPLE_LEADS = [
  {
    id: 'lead_001',
    name: "Alex Rivera",
    service: "Emergency Tree Removal",
    status: "replied",
    conversation: [
       { role: 'assistant', text: 'Hi Alex! Received your request...' },
       { role: 'user', text: 'Yeah trees leaning over fence' }
    ]
  }
]
```
Ensure all modules remain populated with high-fidelity, realistic values.
