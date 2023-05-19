package ndt

// Based on https://github.com/m-lab/tcp-info/blob/601890bc98b74ea56965215cb4383bccd33a3c84/inetdiag/structs.go

type BBRInfo struct {
	BW         int64  `csv:"BBR.BW"`         // Max-filtered BW (app throughput) estimate in bytes/second
	MinRTT     uint32 `csv:"BBR.MinRTT"`     // Min-filtered RTT in uSec
	PacingGain uint32 `csv:"BBR.PacingGain"` // Pacing gain shifted left 8 bits
	CwndGain   uint32 `csv:"BBR.CwndGain"`   // Cwnd gain shifted left 8 bits
}
