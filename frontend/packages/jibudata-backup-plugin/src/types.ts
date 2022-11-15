import {
  //K8sResourceKind,
  K8sResourceCommon,
} from '@console/internal/module/k8s';

// BackupPolicy defines the policy for backup
type BackupPolicy = {
	name?:   string;
	repeat?: boolean; 
	// Cron job like frequency
	// Refer to https://en.wikipedia.org/wiki/Cron for format
	//
	// Predefined schedules:
	// Entry                  | Description                                | Equivalent To
	// -----                  | -----------                                | -------------
	// @yearly (or @annually) | Run once a year, midnight, Jan. 1st        | 0 0 1 1 *
	// @monthly               | Run once a month, midnight, first of month | 0 0 1 * *
	// @weekly                | Run once a week, midnight between Sat/Sun  | 0 0 * * 0
	// @daily (or @midnight)  | Run once a day, midnight                   | 0 0 * * *
	// @hourly                | Run once an hour, beginning of hour        | 0 * * * *
	//
	// Intervals:
	// @every <duration>
	// example: "@every 2h" means a schedule that activates every 2 hours since backup plan added
	frequency?:            string;       // `json:"frequency,omitempty"`
	retention?:           any;// `json:"retention,omitempty"`
	pause?:              boolean;         // `json:"pause,omitempty"`
	snapshotKeptMaxCount?: number;          // `json:"snapshotKeptMaxCount,omitempty"`
	copyMethod?:           string;       // `json:"copyMethod,omitempty"`
};

type DataExportPolicy = {
	exportData?: boolean;   //`json:"exportData,omitempty"`
	exportType?: string; //`json:"exportType,omitempty"`
	// hours
	exportFrequency?: number;          // `json:"exportFrequency,omitempty"`
	exportRetention?: any; // `json:"exportRetention,omitempty"`
	exportTimes?:     string[];    // `json:"exportTimes,omitempty"`
};

// BackupSpec defines the desired state of Backup
type BackupSpec = {
	persistentVolumes?: any //`json:",inline"`
	namespaces?:        string[];              //`json:"namespaces,omitempty"`
	srcClusterRef?:     any //`json:"srcClusterRef,omitempty"`
	migStorageRef?:     any //`json:"migStorageRef,omitempty"`
	hooks?:             any      //`json:"hooks,omitempty"`
	closed?:          boolean                 //`json:"closed,omitempty"`
	policy?:           BackupPolicy          //`json:"policy,omitempty"`
	exportPolicy?:     DataExportPolicy      //`json:"exportPolicy,omitempty"`
	includedResources?: string[]             //`json:"includedResources,omitempty"`
	excludedResources?: string[]            //`json:"excludedResources,omitempty"`
};

// BackupStatus defines the observed state of Backup
type BackupStatus = {
	unhealthyResources?: any //`json:",inline"`
	conditions?: any         //`json:",inline"`
	incompatible?: any       //`json:",inline"`
	observedDigest?:     string       //`json:"observedDigest,omitempty"`
	addedTimestamp?:    any //`json:"addedTimestamp,omitempty"`
	nextBackupTime?:     any //`json:"nextBackupTime,omitempty"`
	currentJobName?:     string       ////`json:"currentJobName,omitempty"`
	state?:              string       //`json:"state,omitempty"`
	nextExportTime?:     any //`json:"nextExportTime,omitempty"`
};

export type BackupKind = K8sResourceCommon & {
    spec: BackupSpec
    status?: BackupStatus
};

// BackupJobSpec defines the desired state of BackupJob
type BackupJobSpec = {
	backupRef?:       any //`json:"backupRef,omitempty"`
	stage?:           boolean                 //`json:"stage"`
	quiescePods?:     boolean                  //`json:"quiescePods,omitempty"`
	keepAnnotations?: boolean                  //`json:"keepAnnotations,omitempty"`
	verify?:          boolean                  //`json:"verify,omitempty"`
	canceled?:        boolean                  //`json:"canceled,omitempty"`
	inactivated?:     boolean                  //`json:"inactivated,omitempty"`
	repeat?:          boolean                  //`json:"repeat,omitempty"`
	exportData?:      boolean                  //`json:"exportData,omitempty"`
}

type ExportResult = {
	DataExportRef?: any //`json:"DataExportRef,omitempty"`
	ExportStatus?:  string                  //`json:"ExportStatus,omitempty"`
}

// BackupJobStatus defines the observed state of BackupJob
type BackupJobStatus = {
	conditions?:     any    //`json:",inline"`
	unhealthyResources?: any //`json:",inline"`
	submitTimestamp?:    any        //`json:"submitTimestamp,omitempty"`
	startTimestamp?:     any        //`json:"startTimestamp,omitempty"`
	stopTimestamp?:      any       //`json:"stopTimestamp,omitempty"`
	observedDigest?:     string              //`json:"observedDigest,omitempty"`
	phase?:              string              //`json:"phase,omitempty"`
	itinerary?:          string              //`json:"itinerary,omitempty"`
	errors?:             string[]            //`json:"errors,omitempty"`
	totalItems?:         number                 //`json:"totalItems,omitempty"`
	backedUpItems?:      number                 //`json:"backedUpItems,omitempty"`
	details?:            any //`json:"details,omitempty"`
	exportResult?:       ExportResult        //`json:"exportResult,omitempty"`
}

// +kubebuilder:object:root=true
// BackupJob is the Schema for the backupjobs API
export type BackupJobKind = K8sResourceCommon & {
	spec:   BackupJobSpec   //`json:"spec,omitempty"`
	status?: BackupJobStatus //`json:"status,omitempty"`
}

// Data Export Type
type ExportPolicy = {
	// Requency of the export, default is 1 export per snapshot
	// Frequency int           `json:"requency,omitempty"`
	retention?: any //`json:"retention,omitempty"`
}

// DataExportSpec defines the desired state of DataExport
type DataExportSpec = {
	type?:         string                    //`json:"type"`
	policy?:       ExportPolicy              //`json:"policy,omitempty"`
	backupJobRef?: any   //`json:"backupJobRef"`
	dataSources?:  any //`json:"dataSources,omitempty"`
	// DataRepo     DataRepoImpl              `json:"dataRepo,omitempty"`
}

// DataExportStatus defines the observed state of DataExport
type DataExportStatus = {
	conditions?: any          //`json:",inline"`
	phase?:               string                       //`json:"phase,omitempty"`
	startTimestamp?:      any                 //`json:"startTimestamp,omitempty"`
	stopTimestamp?:      any                 //`json:"stopTimestamp,omitempty"`
	completionTimestamp?:      any                // `json:"completionTimestamp,omitempty"`
	progress?:{
        [key: string]: TransportProgress //`json:"progress,omitempty"`
    }
	// +kubebuilder:pruning:PreserveUnknownFields
	dataLocations?:      any          //`json:"dataLocations,omitempty"`
	observedDigest?:  string                  //`json:"observedDigest,omitempty"`
	veleroExportRef?:      any  //`json:"veleroExportRef,omitempty"`
}

type TransportProgress = {
	totalBytes?: number //`json:"totalBytes,omitempty"`
	bytesDone?:  number //`json:"bytesDone,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// DataExport is the Schema for the dataexports API
export type DataExportKind = K8sResourceCommon & {
	spec:   DataExportSpec   //`json:"spec,omitempty"`
	status: DataExportStatus //`json:"status,omitempty"`
}

// MigHookSpec defines the desired state of MigHook
type MigHookSpec = {
	custom?:                 boolean   //`json:"custom"`
	image?:                  string //`json:"image"`
	playbook?:               string //`json:"playbook,omitempty"`
	targetCluster?:          string //`json:"targetCluster"`
	activeDeadlineSeconds?:  number  //`json:"activeDeadlineSeconds,omitempty"`
	hookName?:               string //`json:"hookName,omitempty"`
	operation?:              string //`json:"operation,omitempty"`
	command?:                string //`json:"command,omitempty"`
}

// MigHookStatus defines the observed state of MigHook
type MigHookStatus = {
	conditions?: any         //`json:",inline"`
	observedGeneration?:  number //`json:"observedGeneration,omitempty"`
}

// +kubebuilder:object:root=true

// MigHook is the Schema for the mighooks API
export type MigHookKind = K8sResourceCommon & {
	spec:   MigHookSpec   //`json:"spec,omitempty"`
	status: MigHookStatus //`json:"status,omitempty"`
}

// AppHookSpec defines the desired state of AppHook
type AppHookSpec = {
	// Name is a job for backup/restore/migration
	name?: string //`json:"name"`
	// AppProvider is the application identifier for different vendors, such as mysql
	appProvider?: string //`json:"appProvider,omitempty"`
	// Endpoint to connect the applicatio service
	endPoint?: string //`json:"endPoint,omitempty"`
	// Databases
	databases?: string[] //`json:"databases,omitempty"`
	// OperationType is the operation executed in application
	//+kubebuilder:validation:Enum=quiesce;unquiesce
	operationType?: string //`json:"operationType,omitempty"`
	// TimeoutSeconds is the timeout of operation
	//+kubebuilder:validation:Minimum=0
	timeoutSeconds?: number //`json:"timeoutSeconds,omitempty"`
	// Secret to access the application
	secret?: any //`json:"secret,omitempty"`
	// Other options
	params?:{
        [key: string]: string
    } //map[string]string `json:"params,omitempty"`
}

// AppHookStatus defines the observed state of AppHook
//+kubebuilder:subresource:status
type AppHookStatus = {
	phase?: string //`json:"phase,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:printcolumn:name="Age",type=date,JSONPath=.metadata.creationTimestamp
//+kubebuilder:printcolumn:name="Created At",type=string,JSONPath=.metadata.creationTimestamp
//+kubebuilder:printcolumn:name="Phase",type=string,JSONPath=.status.phase,description="Phase"

// AppHook is the Schema for the apphooks API
export type AppHookKind = K8sResourceCommon & {
    spec?:   AppHookSpec   //`json:"spec,omitempty"`
	status?: AppHookStatus //`json:"status,omitempty"`
}

type DisasterRecoverySpec = {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	appName?:  string               // `json:"appName,omitempty"`
	drConfig?: any //`json:"drConfig,omitempty"`
}

type ClusterStatus = {
	name?:   string //`json:"name,omitempty"`
	status?: string //`json:"status,omitempty"`
}

// DisasterRecoveryStatus defines the observed state of DisasterRecovery
type DisasterRecoveryStatus = {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	state?:          string //`json:"state,omitempty"`
	primaryState?:   ClusterStatus //`json:"primaryState,omitempty"`
	secondaryState?: ClusterStatus //`json:"secondaryState,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// DisasterRecovery is the Schema for the disasterrecoveries API
export type DrKind = K8sResourceCommon & {
	spec?:   DisasterRecoverySpec   //`json:"spec,omitempty"`
	status?: DisasterRecoveryStatus //`json:"status,omitempty"`
}

type DrConfigSpec = {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	srcCluster?: string //`json:"srcCluster,omitempty"`
	dstCluster?: string //`json:"dstCluster,omitempty"`
	syncType?:   string //`json:"syncType,omitempty"`
	poolName?:   string //`json:"poolName,omitempty"`
}

// DrConfigStatus defines the observed state of DrConfig
type DrConfigStatus = {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	state?: string //`json:"state,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// DrConfig is the Schema for the drconfigs API
export type DrConfigKind = K8sResourceCommon & {
	spec?:   DrConfigSpec   //`json:"spec,omitempty"`
	status?: DrConfigStatus //`json:"status,omitempty"`
}

type FsmStatus = {
	fsmState?: string //           StateMachineState `json:"fsmState,omitempty"`
	fsmPreState?: string //       StateMachineState `json:"fsmPreState,omitempty"`
	lastTransitionTime?: any // *metav1.Time      `json:"lastTransitionTime,omitempty"`
}

type SubFsmStatus = {
	subFsmName?: string    //`json:"subFsmName,omitempty"`
	status?:     FsmStatus //`json:"status,omitempty"`
}

type DrFsmStatus = {
	mainStatus?:   FsmStatus    //`json:"mainStatus,omitempty"`
	subStatus?:    SubFsmStatus //`json:"subStatus,omitempty"`
	availableOps?: string[]     //`json:"availableOps,omitempty"`
}

type DrOperationRequestSpec = {
	drInstanceName?:   string      //`json:"drInstanceName"`
	operation?:        string      //`json:"operation"`
	fsmCurrentStatus?: DrFsmStatus //`json:"fsmCurrentStatus,omitempty"`
}

type DrOperationRequestStatus = {
	phase?: string             //DrOperationRequestPhase `json:"phase,omitempty"`
	processedTimestamp?: any //*metav1.Time            `json:"processedTimestamp,omitempty"`
}

//+kubebuilder:object:root=true

// DrOperationRequest is the Schema for the droperationrequests API
export type DrOperationRequest = K8sResourceCommon & {
	spec?:   DrOperationRequestSpec   //`json:"spec,omitempty"`
	status?: DrOperationRequestStatus //`json:"status,omitempty"`
}

type DirectiveControl = {
	phase?:     string //`json:"phase,omitempty"`
	action?:    string //`json:"action,omitempty"`
	confirmed?: boolean   //`json:"confirmed,omitempty"`
}

type FunctionStep = {
	step?:                string       //`json:"step,omitempty"`
	startTimestamp?:      any //*metav1.Time //`json:"startTimestamp,omitempty"`
	completionTimestamp?: any //*metav1.Time //`json:"completionTimestamp,omitempty"`
}

type DrOperationSpec = {
	rrInstanceName?: string              //`json:"drInstanceName"`
	operationType?:  string              //`json:"operationType"`
	subOperation?:   string              //`json:"subOperation"`
	directives?:     DirectiveControl[] //`json:"directives,omitempty"`
}

type ClusterRoleChangeStatus = {
	primary?:   string //`json:"primary,omitempty"`
	secondary?: string //`json:"secondary,omitempty"`
}

type DrOperationStatus = {
	phase?:               string                   //`json:"phase,omitempty"`
	state?:               string                   //`json:"state,omitempty"`
	steps?:               FunctionStep[]          //`json:"steps,omitempty"`
	roleStatus?:          ClusterRoleChangeStatus //`json:"roleStatus,omitempty"`
	startTimestamp?:      any //*metav1.Time             //`json:"startTimestamp,omitempty"`
	completionTimestamp?: any //*metav1.Time             //`json:"completionTimestamp,omitempty"`
	//yscorev1.Issues?:     //`json:",inline"`
}

//+kubebuilder:object:root=true

// DrOperation is the Schema for the droperations API
export type DrOperation = K8sResourceCommon & {
	spec?:   DrOperationSpec   //`json:"spec,omitempty"`
	status?: DrOperationStatus //`json:"status,omitempty"`
}
