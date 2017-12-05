const recordingState = {
  STOPPED: 0,
  RECORDING: 1,
  PAUSED: 2,
};

const status = {
  UNKNOWN: 0,
  OFFLINE: 1,
  WARNING: 2,
  ONLINE: 3,
};

const roomRole = {
  IDLE: 'idle',
  HUDDLE_SPACE: 'huddle_space',
  BYOD: 'byod',
  COLLABORATION: 'collaboration',
  COLL_BREAKOUT: 'coll_breakout',
  OVERFLOW_MASTER: 'overflow_master',
  OVERFLOW_SLAVE: 'overflow_slave',
  VIRTUAL: 'virtual',
  EMERGENCY_ALERT: 'emergency_alert',
  SERVICE: 'service',
  INTERACTIVE: 'interactive',
};

const moderationPolicy = {
  ALLOW_NONE: 0,
  ALLOW_HOSTS: 1,
  ALLOW_AUTHENTICATED: 2,
  ALLOW_ALL: 3,
};

const audioSinkRole = {
  IDLE: 'idle',
  MAIN_MIX: 'main_mix',
  LOCAL_MIX: 'local_mix',
  REMOTE_MIX: 'remote_mix',
  AEC_REF_MIX: 'aec_ref_mix',
};

const audioSourceRole = {
  IDLE: 'idle',
  AUX_IN: 'aux_in',
  AEC_MIC_IN: 'aec_mic_in',
};

const cameraRole = {
  IDLE: 'idle',
  ROOM: 'room',
  PRESENTER: 'presenter',
  CONTENT: 'content',
};

const usbCameraSettingType = {
  MENU: 'menu',
  INT: 'int',
  BOOL: 'bool',
};

const deviceRole = {
  IDLE: 'idle',
  MASTER: 'master',
  COLLABORATION_MASTER: 'collaboration_master',
  COLLABORATION_POD: 'collaboration_pod',
  OVERFLOW_MASTER: 'overflow_master',
  OVERFLOW_SLAVE: 'overflow_slave',
  VIRTUAL_MASTER: 'virtual_master',
  VIRTUAL_TILE: 'virtual_tile',
  FAR_END: 'far_end',
  CONFIDENCE_OVERFLOW_MASTER: 'confidence_overflow_master',
  CONFIDENCE_OVERFLOW_SLAVE: 'confidence_overflow_slave',
};

const displayRole = {
  IDLE: 'idle',
  MAIN_OUT: 'main_out',
  LOCAL_CLONE: 'local_clone',
  REMOTE_CLONE: 'remote_clone',
  SELF_VIEW_SLAVE: 'self_view_slave',
  SELF_VIEW_MASTER_COMBINED: 'self_view_master_combined',
  SELF_VIEW_MASTER_CONTENT: 'self_view_master_content',
  SELF_VIEW_MASTER_TEACHER: 'self_view_master_teacher',
  SLAVE_COMBINED_FROM_MASTER: 'slave_combined_from_master',
  SLAVE_CONTENT_FROM_MASTER: 'slave_content_from_master',
  SLAVE_TEACHER_FROM_MASTER: 'slave_teacher_from_master',
  COLLABORATION_MASTER_MAIN_OUT: 'collaboration_master_main_out',
  COLLABORATION_POD_MAIN_OUT: 'collaboration_pod_main_out',
  OVERFLOW_REMOTE: 'overflow_remote',
  HTML_TILE_OUT: 'html_tile_out',
  HTML_CAMERA_MANAGER: 'html_camera_manager',
  HTML_GUI_OUT: 'html_gui_out',
  AUXILIARY: 'auxiliary',
};

module.exports = {
  recordingState,
  status,
  audioSinkRole,
  audioSourceRole,
  usbCameraSettingType,
  cameraRole,
  moderationPolicy,
  deviceRole,
  roomRole,
  displayRole,
}