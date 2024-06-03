# Active Directory Instructions

This document aims to walk you through the steps necessary to deploy the MSI installer using a GPO (Group Policy Object)
through Active Directory


## Requirements

### 1. Installer

Download the latest [MSI installer](https://pods.radartoolkit.com/client_versions/stable/packages/msi-amd64/download)

### 2. MSI Transformer

>If you already have an MSI transformer with you, please proceed to the next [Installation Section](#installation)


The installer comes with three configurable properties:

* ACCOUNT_TOKEN: A token used to link the pod into your account at installation time
* REGISTER_LABEL: A text field, this can hold any string and can be used to trace back a computer installation in our backend. Can be the computer name and/or any env variable.
* REPLACE_EXISTING_CONFIG: Set it to any value, and the installer will generate a new configuration file, meaning it will register itself as a new pod + link to an account if ACCOUNT_TOKEN is given.

When deploying through active directory, you can't set those properties directly. You have to use something called an MSI Transformer.
This transformer works as a layer of configuration on top of the MSI, and for our case, can be used to set these two properties in our MSI.

#### 2.1 Using a baseline Transformer

If all you want is to set an account token and the computer name in REGISTER_LABEL, then we already have a [Baseline Transformer](files/ActiveDirectoryInstructions/Radar-Baseline.mst) you can use. No need to go through the next steps except for how to get the ACCOUNT_TOKEN [here](#221-configure-account_token-property) and then you'll have to open the baseline file with an editor and replace `REPLACE_ME_WITH_A_TOKEN` with the Account Token you got.

Suggestion, you can use `sed` command for this if you have it

```sh
sed -e 's/REPLACE_ME_WITH_A_TOKEN/<the token>/' Radar-Baseline.mst | tee Radar-MyToken.mst
```

In case you also want it to replace the existing configuration when installed, use [Radar-Baseline With Replace](files/ActiveDirectoryInstructions/Radar-Baseline-With-Replace.mst) instead.

#### 2.2 Creating the MSI Transformer (.mst)

To create a transformer, first you need to install an application called [Orca](https://learn.microsoft.com/pt-br/windows/win32/msi/orca-exe).

With Orca installed, you right click `RadarAgent.msi` installer, and select `Edit with Orca`. It will open Orca and you'll be able to see all configurations on this MSI.


##### 2.2.1 Configure ACCOUNT_TOKEN property

First, we'll set the ACCOUNT_TOKEN propery. This requires you to fetch the token field from `users_accounts` table in the Database.

If you log into the rails console, you could run something like:

```rb
UsersAccount.find_by(user_id: <your_id>, account_id: <account_id>).token
```

This gets you the token for a specific account you belong to.

Now, in Orca:

1. Click in the `Transform` menu on the top, and select `New Transform`. Any modification you do now will be registered and we'll save it as a .mst file.
2. You'll see a **Tables**  list in the left, go to `Property`. In the right hand side of the window, right click anywhere and select `Add Row`.
3. Type "ACCOUNT_TOKEN" in `Property`, and put the token in `Value`.


That's it, now when we reference this transformer, the MSI will have the account token set.

##### 2.2.1 Configure REGISTER_LABEL

`REGISTER_LABEL` has a different configuration. Usually, we want to put something like the computer name, or an environment variable. This means we don't know that value at the time we are creating this file, given that's in the target machine.

So, in order to do this, we need to create something called a [CustomAction Type 51](https://learn.microsoft.com/lv-lv/windows/win32/msi/custom-action-type-51). Don't mind this weird name/number, just tag along with me.

Custom actions are something you wish to run at some time during the installation. You can run binaries, and do stuff such as setting a property based on another property / environment variable.

In this document, I'll set it to `ComputerName;EnvironmentVariable`. Where the env. variable is called `MYVAR`.

1. In the tables list on the left, select `CustomAction`.
2. In the right hand side, right click and select `Add Row`.
3. Insert the following in the form:
   1. Action: SetRegisterLabel
   2. Type: 51
   3. Source: REGISTER_LABEL
   4. Target: [ComputerName];[%MYVAR]


Good, now you configured the Action, but you aren't calling it yet. For that, we need to register it in the `InstallExecuteSequence`. Where we'll tell the installer when to execute it.

1. In the tables list on the left, select `InstallExecuteSequence`
2. In the right hand side, right click and select `Add Row`.
3. Insert the following in the form:
   1. Action: SetRegisterLabel -- This is the same value from the previous steps.
   2. Condition: Leave this in blank
   3. Sequence: 990 -- Should run before `CostFinalize`.


Ok, now we have everything configured, it's time to generate the Transformer file. Click on the `Transform` menu, and select `Generate Transform`. This will ask you where to save the file, put it in the same directory of the installer, we'll need to store both in a shared folder next.

## Installation

### Manual Installation

In case you want to install an MSI manually, be it for test or whatever reason,
you can do it by opening the Windows terminal with admin privilleges and type:

```
msiexec.exe /i RadarAgent.msi
```

If you want to set either ACCOUNT_TOKEN and/or REGISTER_LABEL manually, all you have to do is add these arguments at the end of the command:

```
msiexec.exe /i RadarAgent.msi ACCOUNT_TOKEN=<something> REGISTER_LABEL=<anotherthing>
```

Now, if you have an MST file with you and want to test it, such as the basefile [Radar-Baseline.mst](files/ActiveDirectoryInstructions/Radar-Baseline.mst), you can as follows:

```
msiexec.exe /i RadarAgent.msi TRANSFORMS=Radar-Baseline.mst
```

### Steps to install through in Active Directory


With the installer (.msi), and the MSI transformer (.mst) in hand, you have to put them in a shared folder, and ensure all computers have access to it.

1. In `Group Policy Management` application, Create a Group Policy Object (GPO).

2. Right click it and select Edit.
3. In Computer Configuration, expand `Policies -> Software Settings -> Software Installation`

4. Right click and select `New -> Package`

5. Navigate to the Shared folder. — **You should navigate through the network share address, not your local folder. Eg: \\DC1\PathToShare\RadarAgent.msi**

6. Select Advanced method, and it will pop up a properties window

7. Give it a name. eg: RadarAgent

8. Move to "Modifications" tab, and click "Add"

9. Select the MSI transformer "radarTransform.mst". Remember to select the Network path, not your local path.

10. Hit Ok, and check that the software deployment appears in the "Software Installation" section.

11. Link this new GPO to the Computers group you wish to deploy

12. Wait for it to synchronize, or have the target computers reboot

13. Go to https://pods.radartoolkit.com, and check your available pods. You should be able to see them there.


> At least in my tests, whenever I linked the GPO to a computer group, I had to restart the PC twice for it to install. Maybe the first one syncs and schedule an install in the next reboot.

