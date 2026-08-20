export default {
  async email(message, env) {
    const recipient = String(message.to || "").toLowerCase();
    const prefix = recipient.split("@")[0];

    const alias = await env.DB.prepare(
      "SELECT id FROM email_aliases WHERE prefix = ? AND enabled = 1 LIMIT 1"
    ).bind(prefix).first();

    if (!alias) {
      message.setReject("Unknown recipient.");
      return;
    }

    const target = await env.DB.prepare(
      `SELECT target_email
       FROM email_alias_targets
       WHERE alias_id = ?
       ORDER BY is_primary DESC, target_email ASC
       LIMIT 1`
    ).bind(alias.id).first();

    if (!target) {
      message.setReject("Recipient temporarily unavailable.");
      return;
    }

    await message.forward(target.target_email);
  }
};
