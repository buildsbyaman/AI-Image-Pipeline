import fs from 'fs';
import path from 'path';

export type TemplateVariables = {
  APP_NAME?: string;
  USER_NAME?: string;
  JOB_ID?: string;
  YEAR?: string;
  FLAGGED_CATEGORY?: string;
  [key: string]: string | undefined;
};

// Render template by reading the file and replacing placeholders
export const renderTemplate = (
  templateName: string,
  type: 'html' | 'txt',
  variables: TemplateVariables
): string => {
  const filePath = path.join(__dirname, 'templates', `${templateName}.${type}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template ${templateName}.${type} not found at ${filePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Set default variables if not provided
  const templateData: TemplateVariables = {
    APP_NAME: 'AI Image Pipeline',
    YEAR: new Date().getFullYear().toString(),
    ...variables,
  };

  // Replace all placeholders in the format {{KEY}}
  Object.keys(templateData).forEach((key) => {
    const value = templateData[key];
    if (value !== undefined) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }
  });

  return content;
};
