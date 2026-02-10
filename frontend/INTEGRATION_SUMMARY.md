# Integration Summary: Sanitisation & Trial Room

The integration of the Sanitisation Page and Trial Room is complete.

## Key Features Implemented:
1.  **Chat-Based Sanitisation UI**:
    -   Secure `ChatInput` for text and file uploads.
    -   Real-time processing feedback (scanning/tokenizing animations).
    -   Left/Right bubble alignment for clear conversation flow.

2.  **API Integration**:
    -   Connected `sanitizeText` and `sanitizePdf` endpoints.
    -   **Vault Storage**: Tokens are automatically stored in the secure vault upon successful response.
    -   **Processing IDs**: Unique IDs generated for each operation for audit trails.

3.  **Seamless Navigation**:
    -   **Chat -> Sanitisation**: Input carries over and auto-starts processing.
    -   **Sanitisation -> Trial Room**: "Enter Trial Room" button triggers auto-start of the debate simulation in `TrialRoom.tsx`.

## How to Test:
1.  Navigate to the main Chat page.
2.  Type a message or upload a PDF.
3.  Observe the transition to the Sanitisation page and the automatic processing.
4.  Once complete, click "ENTER TRIAL ROOM".
5.  Observe the Trial Room starting the debate immediately.

## Verification:
-   `npm run build`: **PASSED**
-   `tsc`: **PASSED**
