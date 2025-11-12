# Localization

We want to localize this application, which is currently fixed to just English. The text shown in this application is sitting as plain text inside the different components and HTML tags, so we need to replace all fixed strings for localizable entries.

For this we will need:
1. Install localization library like i18next
2. Initialize the i18n config to initially support English
3. Create localization file for English
4. Replace all strings that are hardcoded for their localized alternative

We will eventually need to translate to Spanish, but for now, let's focus on just supporting localization and starting off with replacing hardcoded strings for calls to the `t` method for i18n with their corresponding string in the .yml file.