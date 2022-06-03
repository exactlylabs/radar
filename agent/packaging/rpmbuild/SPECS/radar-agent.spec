Name:           radar-agent
Version:        ${VERSION}
Release:        1%{?dist}
Summary:        Installs a service that runs speed tests continually
License:        GPL
URL:            radar.exactlylabs.com
Source0:        %{name}-%{version}.tar.gz

BuildRequires:  systemd-rpm-macros

%description
RPM Package containing the radar agent binary and system configuration files

%prep
%autosetup

%install
install -Dpm 0755 %{name} %{buildroot}%{_bindir}/%{name}
install -Dpm 644 %{name}.service %{buildroot}%{_unitdir}/%{name}.service

%post
%systemd_post %{name}.service

%preun
%systemd_preun %{name}.service


%files
%{_bindir}/%{name}
%{_unitdir}/%{name}.service


%changelog
* Thu Jun 02 2022 root
- 
