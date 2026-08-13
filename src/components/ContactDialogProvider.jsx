import { createContext, useCallback, useContext, useMemo, useState } from "react";

import ContactModal from "./ContactModal.jsx";

const ContactDialogContext = createContext(null);

export function ContactDialogProvider({ children }) {
  const [contactOpen, setContactOpen] = useState(false);
  const openContactDialog = useCallback(() => setContactOpen(true), []);
  const closeContactDialog = useCallback(() => setContactOpen(false), []);
  const value = useMemo(
    () => ({ contactOpen, openContactDialog }),
    [contactOpen, openContactDialog],
  );

  return (
    <ContactDialogContext.Provider value={value}>
      {children}
      <ContactModal open={contactOpen} onClose={closeContactDialog} />
    </ContactDialogContext.Provider>
  );
}

export function useContactDialog() {
  const context = useContext(ContactDialogContext);
  if (!context) {
    throw new Error("useContactDialog must be used inside ContactDialogProvider");
  }
  return context;
}
