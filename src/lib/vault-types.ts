export interface ShareLinkView {
  id: string;
  token: string;
  type: "EXPIRING" | "UNLIMITED";
  expiresAt: string | null;
  revoked: boolean;
  expired: boolean;
  allowedEmails: string[];
  createdAt: string;
}

export interface VaultFileView {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  links: ShareLinkView[];
}
