class Pool {
  final String id;
  final String name;
  final String ipAddress;
  final int port;
  final bool isConnected;
  final String status;
  final DateTime lastSeen;

  Pool({
    required this.id,
    required this.name,
    required this.ipAddress,
    required this.port,
    this.isConnected = false,
    this.status = 'Disponible',
    required this.lastSeen,
  });

  factory Pool.fromJson(Map<String, dynamic> json) {
    return Pool(
      id: json['id'],
      name: json['name'],
      ipAddress: json['ipAddress'],
      port: json['port'],
      isConnected: json['isConnected'] ?? false,
      status: json['status'] ?? 'Disponible',
      lastSeen: DateTime.parse(json['lastSeen']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ipAddress': ipAddress,
      'port': port,
      'isConnected': isConnected,
      'status': status,
      'lastSeen': lastSeen.toIso8601String(),
    };
  }
}
