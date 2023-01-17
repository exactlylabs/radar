import consumer from "./consumer";

consumer.subscriptions.create({ channel: 'PodStatusChannel' }, {
  // Called when there is an incoming message on the queue
  received(data) {
    if(!!data[0]) {
      data.forEach(client => this.editClientData(client));
    } else {
      this.editClientData(data);
    }
  },
  editClientData(client) {
    if(document.getElementById(`client_${client.id}_row`))
      this.editIndexClientRow(client);
    if(document.getElementById(`client_${client.id}_details`))
      this.editClientOverview(client);
  },
  editIndexClientRow(client) {
    this.editBasicInfo(client);

  },
  editClientOverview(client) {
    this.editBasicInfo(client);
    this.editBasicInfo(client, '_small');
  },
  editBasicInfo(client, idSuffix = '') {
    const clientNameElement = document.getElementById(`client_${client.id}_name${idSuffix}`);
    if(clientNameElement) clientNameElement.innerText = !!client.name ? client.name : 'Unnamed Pod';
    const clientStatusElement = document.getElementById(`client_${client.id}_status${idSuffix}`);
    const currentStatus = client.online ? client.test_requested ? 'Test running' : 'Active' : 'Offline';
    const currentStatusBadgeColor =
      currentStatus === 'Test running' ? 'badge-light-primary' :
        currentStatus === 'Active' ? 'badge-light-success' :
          'badge-light-danger';
    const currentStatusClass = `badge ${currentStatusBadgeColor}`;
    if(clientStatusElement) {
      clientStatusElement.innerText = currentStatus;
      clientStatusElement.setAttribute('class', currentStatusClass);
    }
    const hasPendingBadgeAlready = !!document.getElementById(`client_${client.id}_status_pending${idSuffix}`) ||
      !!document.getElementById(`client_${client.id}_status_pending`);
    if(currentStatus === 'Offline' && client.test_requested && !hasPendingBadgeAlready) {
      const wrapper = document.getElementById(`client_${client.id}_status_wrapper${idSuffix}`);
      const pendingTestBadge = '<span class="badge badge-light-primary">Pending test</span>';
      if(wrapper) wrapper.insertAdjacentHTML( 'beforeend', pendingTestBadge);
    }
  }
})