# Generated by Django 1.11.29 on 2021-03-22 17:36

from django.db import migrations
from enum import Enum

from sentry.utils.query import RangeQuerySetWrapperWithProgressBar


class UserOptionValue:
    # 'workflow:notifications'
    all_conversations = "0"
    participating_only = "1"
    no_conversations = "2"
    # 'deploy-emails
    all_deploys = "2"
    committed_deploys_only = "3"
    no_deploys = "4"


class ExternalProviders(Enum):
    GITHUB = 0
    GITLAB = 1
    EMAIL = 100
    SLACK = 110


class NotificationScopeType(Enum):
    USER = 0
    ORGANIZATION = 10
    PROJECT = 20


class NotificationSettingTypes(Enum):
    # top level config of on/off
    # for workflow also includes SUBSCRIBE_ONLY
    # for deploy also includes COMMITTED_ONLY
    DEFAULT = 0
    # send deploy notifications
    DEPLOY = 10
    # notifications for issues
    ISSUE_ALERTS = 20
    # notifications for changes in assignment, resolution, comments
    WORKFLOW = 30


class NotificationSettingOptionValues(Enum):
    DEFAULT = 0  # Defer to a setting one level up.
    NEVER = 10
    ALWAYS = 20
    SUBSCRIBE_ONLY = 30  # workflow
    COMMITTED_ONLY = 40  # deploy


def copy_useroption_to_notificationsetting(apps, schema_editor):
    UserOption = apps.get_model("sentry", "UserOption")
    User = apps.get_model("sentry", "User")
    NotificationSetting = apps.get_model("sentry", "NotificationSetting")
    for user_option in RangeQuerySetWrapperWithProgressBar(UserOption.objects.all()):
        if user_option.key == "workflow:notifications":
            # if you have fine tuning for projects, project_id will have a value (rather than None)
            if user_option.project_id:
                scope_identifier = user_option.project_id
                scope_type = NotificationScopeType.PROJECT.value
            else:
                scope_identifier = user_option.user.id
                scope_type = NotificationScopeType.USER.value
            type = NotificationSettingTypes.WORKFLOW.value
            if user_option.value == UserOptionValue.all_conversations:
                value = NotificationSettingOptionValues.ALWAYS.value
            if user_option.value == UserOptionValue.participating_only:
                value = NotificationSettingOptionValues.SUBSCRIBE_ONLY.value
            if user_option.value == UserOptionValue.no_conversations:
                value = NotificationSettingOptionValues.NEVER.value
        elif user_option.key == "mail:alert":  # fine tuned project alerts
            if user_option.project_id:
                scope_identifier = user_option.project_id
                scope_type = NotificationScopeType.PROJECT.value
            else:
                scope_identifier = user_option.user.id
                scope_type = NotificationScopeType.USER.value
            type = NotificationSettingTypes.ISSUE_ALERTS.value
            if int(user_option.value) == 0:
                value = NotificationSettingOptionValues.NEVER.value
            if int(user_option.value) == 1:
                value = NotificationSettingOptionValues.ALWAYS.value
        elif user_option.key == "subscribe_by_default":  # top level project alerts on/off
            scope_identifier = user_option.user.id
            scope_type = NotificationScopeType.USER.value
            type = NotificationSettingTypes.ISSUE_ALERTS.value
            if int(user_option.value) == 1:
                value = NotificationSettingOptionValues.ALWAYS.value
            if int(user_option.value) == 0:
                value = NotificationSettingOptionValues.NEVER.value
        elif user_option.key == "deploy-emails":
            # if you have fine tuning for an org, organization_id will have a value (rather than None)
            if user_option.organization_id:
                scope_identifier = user_option.organization_id
                scope_type = NotificationScopeType.ORGANIZATION.value
            else:
                scope_identifier = user_option.user.id
                scope_type = NotificationScopeType.USER.value
            type = NotificationSettingTypes.DEPLOY.value
            # if you've not explicitly set anything OR set it to default, there is no db row
            # by default deploy notifications are set to committed_deploys_only,
            # but there will be an entry for the top level alert option
            # if you change the value to something else
            if user_option.value == UserOptionValue.all_deploys:
                value = NotificationSettingOptionValues.ALWAYS.value
            if user_option.value == UserOptionValue.no_deploys:
                value = NotificationSettingOptionValues.NEVER.value
            if user_option.value == UserOptionValue.committed_deploys_only:
                value = NotificationSettingOptionValues.COMMITTED_ONLY.value
        else:
            continue
        user = User.objects.select_related("actor").get(id=user_option.user_id)
        NotificationSetting.objects.update_or_create(
            scope_type=scope_type,  # user, org, or project
            scope_identifier=scope_identifier,  # user_id, organization_id, or project_id
            target=user.actor,
            provider=ExternalProviders.EMAIL.value,  # 100
            type=type,
            defaults={"value": value},  # NotificationSettingOptionValues
        )


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = True
    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    # You'll also usually want to set this to `False` if you're writing a data
    # migration, since we don't want the entire migration to run in one long-running
    # transaction.
    atomic = False
    dependencies = [
        ("sentry", "0180_add_saved_search_sorts"),
    ]
    operations = [
        migrations.RunPython(
            copy_useroption_to_notificationsetting, reverse_code=migrations.RunPython.noop
        )
    ]
