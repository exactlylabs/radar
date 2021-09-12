package sshconfig

import (
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"strconv"
	"strings"
)

var addUserCommand = "adduser"
var addUserArgs = `--disabled-password --gecos "" %v`
var restartSSHCommand = "systemctl"
var restartSSHArgs = "reload sshd"

func WriteConfig(username string, port int, publicKey string) error {
	filename := fmt.Sprintf("/etc/ssh/sshd_config.d/radar-%v.conf", username)
	config := fmt.Sprintf(`Match User %v
  AllowTcpForwarding remote
  AllowStreamLocalForwarding no
  X11Forwarding no
  AllowAgentForwarding no
  ForceCommand /bin/false
  GatewayPorts yes
  PermitListen %d
	`, username, port)
	fmtAddUserArgs := fmt.Sprintf(addUserArgs, username)
	sshDir := fmt.Sprintf("/home/%v/.ssh", username)
	authKeyPath := fmt.Sprintf("%v/authorized_keys", sshDir)

	if os.Getenv("RADAR_MODE") != "production" {
		fmt.Println("WOULD WRITE", filename)
		fmt.Println(config)
		fmt.Println("WOULD RUN", addUserCommand, fmtAddUserArgs)
		fmt.Println("WOULD MKDIR", sshDir)
		fmt.Println("WOULD WRITE", authKeyPath)
		fmt.Println(publicKey)
		fmt.Println("WOULD CHANGE OWNERSHIP")
		fmt.Println("WOULD RUN", restartSSHCommand, restartSSHArgs)
	} else {
		f, cErr := os.Create(filename)
		if cErr != nil {
			return cErr
		}
		defer f.Close()

		// Write ssh config for new user
		if _, wErr := f.WriteString(config); wErr != nil {
			return wErr
		}

		// Add new user
		fmt.Println("RUNNING", addUserCommand, strings.Split(fmtAddUserArgs, " "))
		cmd := exec.Command(addUserCommand, strings.Split(fmtAddUserArgs, " ")...)
		if sErr := cmd.Start(); sErr != nil {
			return sErr
		}
		if wErr := cmd.Wait(); wErr != nil {
			return fmt.Errorf("error while running %v: %w", addUserCommand, wErr)
		}

		// Make .ssh dir for user
		if mErr := os.Mkdir(sshDir, 0700); mErr != nil {
			return mErr
		}
		f, caErr := os.Create(authKeyPath)
		if caErr != nil {
			return caErr
		}
		defer f.Close()

		// Make authorized keys dir for user
		if _, waErr := f.WriteString(publicKey); waErr != nil {
			return waErr
		}

		// Lookup new user's UID / GID
		u, uErr := user.Lookup(username)
		if uErr != nil {
			return uErr
		}

		uid, aErr := strconv.Atoi(u.Uid)
		if aErr != nil {
			return aErr
		}
		gid, gErr := strconv.Atoi(u.Gid)
		if gErr != nil {
			return gErr
		}

		// Set ownership of .ssh / authorized_keys files
		if cErr := os.Chown(sshDir, uid, gid); cErr != nil {
			return cErr
		}

		if cErr := os.Chown(authKeyPath, uid, gid); cErr != nil {
			return cErr
		}

		// Reload SSHD config
		cmd = exec.Command(restartSSHCommand, strings.Split(restartSSHArgs, " ")...)
		if sErr := cmd.Start(); sErr != nil {
			return sErr
		}
		if wErr := cmd.Wait(); wErr != nil {
			return fmt.Errorf("error while running %v: %w", restartSSHCommand, wErr)
		}
	}

	return nil
}
