import axios from "axios";

export type GlobalMergeVars = {
  name: string;
  content: string;
};

export async function sendEmail(
  toEmail: string,
  fromEmail: string = "hi@mintlify.com",
  template_name: string = "doc-change-alert",
  global_merge_vars: GlobalMergeVars[] = []
) {
  await axios.post("https://mandrillapp.com/api/1.0/messages/send-template", {
    key: process.env.MAILCHIMP_TRANSACTIONAL_KEY,
    template_name,
    template_content: [],
    message: {
      to: [{ email: toEmail }],
      from_email: fromEmail,
      from_name: fromEmail,
      merge_language: "handlebars",
      global_merge_vars,
    },
  });
}
