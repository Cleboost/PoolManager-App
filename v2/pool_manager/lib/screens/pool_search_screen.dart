import 'package:flutter/material.dart';
import '../models/pool.dart';
import '../services/pool_scanner_service.dart';
import '../services/pool_storage_service.dart';
import 'pool_dashboard_screen.dart';

class PoolSearchScreen extends StatefulWidget {
  const PoolSearchScreen({super.key});

  @override
  State<PoolSearchScreen> createState() => _PoolSearchScreenState();
}

class _PoolSearchScreenState extends State<PoolSearchScreen>
    with TickerProviderStateMixin {
  late AnimationController _searchController;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  
  bool _isSearching = false;
  List<Pool> _foundPools = [];
  double _progress = 0.0;
  String _currentLog = '';
  final List<String> _logs = [];
  
  final PoolScannerService _scannerService = PoolScannerService();
  final PoolStorageService _storageService = PoolStorageService();

  @override
  void initState() {
    super.initState();
    _searchController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    // Écouter les événements du scanner (pour les mises à jour en temps réel)
    _scannerService.poolFoundStream.listen((pool) {
      // Ne rien faire ici car les piscines sont déjà ajoutées via scanNetwork()
    });

    _scannerService.progressStream.listen((progress) {
      setState(() {
        _progress = progress;
      });
    });

    _scannerService.logStream.listen((log) {
      setState(() {
        _currentLog = log;
        _logs.add(log);
        if (_logs.length > 10) {
          _logs.removeAt(0);
        }
      });
    });
  }

  void _startSearch() async {
    setState(() {
      _isSearching = true;
      _foundPools.clear();
      _progress = 0.0;
      _logs.clear();
    });
    
    _searchController.repeat();
    _pulseController.repeat();
    
    try {
      List<Pool> pools = await _scannerService.scanNetwork();
      setState(() {
        _foundPools = pools;
      });
    } catch (e) {
      setState(() {
        _currentLog = 'Erreur: $e';
      });
    } finally {
      setState(() {
        _isSearching = false;
      });
      _searchController.stop();
      _pulseController.stop();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _pulseController.dispose();
    _scannerService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              // Header
              const SizedBox(height: 20),
              const Text(
                'Pool Manager',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
                             const Text(
                 'Connexion à votre piscine',
                 style: TextStyle(
                   fontSize: 16,
                   color: Colors.grey,
                 ),
               ),
               const SizedBox(height: 8),
               const Text(
                 'Assurez-vous d\'être sur le même réseau WiFi que votre piscine',
                 style: TextStyle(
                   fontSize: 12,
                   color: Colors.grey,
                 ),
                 textAlign: TextAlign.center,
               ),
              const SizedBox(height: 40),

              // Search Animation
              if (_isSearching) ...[
                AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _pulseAnimation.value,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0EA5E9), Color(0xFF3B82F6)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0EA5E9).withValues(alpha: 0.3),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.pool,
                          size: 60,
                          color: Colors.white,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 30),
                const Text(
                  'Recherche en cours...',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  _currentLog,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                // Barre de progression réelle
                LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: Colors.grey[800],
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    Color(0xFF0EA5E9),
                  ),
                ),
                const SizedBox(height: 10),
                                 Text(
                   _foundPools.isNotEmpty 
                     ? 'Piscine trouvée ! 🎉'
                     : '${(_progress * 100).toInt()}% - Recherche en cours...',
                   style: TextStyle(
                     fontSize: 12,
                     color: _foundPools.isNotEmpty ? const Color(0xFF10B981) : Colors.grey,
                   ),
                 ),
              ] else ...[
                // Search Button
                Container(
                  width: double.infinity,
                  height: 120,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0EA5E9), Color(0xFF3B82F6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0EA5E9).withValues(alpha: 0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _startSearch,
                      borderRadius: BorderRadius.circular(20),
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search,
                              size: 40,
                              color: Colors.white,
                            ),
                            SizedBox(height: 8),
                                                         Text(
                               'Trouver ma piscine',
                               style: TextStyle(
                                 fontSize: 18,
                                 fontWeight: FontWeight.bold,
                                 color: Colors.white,
                               ),
                             ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 30),

              // Results
              if (_foundPools.isNotEmpty) ...[
                Row(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Color(0xFF10B981),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                                         Text(
                       _foundPools.length == 1 
                         ? 'Piscine connectée'
                         : '${_foundPools.length} piscine(s) trouvée(s)',
                       style: const TextStyle(
                         fontSize: 16,
                         color: Colors.white,
                         fontWeight: FontWeight.w500,
                       ),
                     ),
                  ],
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: ListView.builder(
                    itemCount: _foundPools.length,
                    itemBuilder: (context, index) {
                      final pool = _foundPools[index];
                      return _buildPoolCard(pool);
                    },
                  ),
                ),
              ] else if (!_isSearching) ...[
                const Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.pool_outlined,
                          size: 80,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 20),
                                                 Text(
                           'Piscine non détectée',
                           style: TextStyle(
                             fontSize: 18,
                             color: Colors.grey,
                           ),
                         ),
                         SizedBox(height: 10),
                         Text(
                           'Vérifiez que votre piscine est allumée et connectée au WiFi',
                           style: TextStyle(
                             fontSize: 14,
                             color: Colors.grey,
                           ),
                           textAlign: TextAlign.center,
                         ),
                      ],
                    ),
                  ),
                ),
              ],

              // Logs en mode debug
              if (_isSearching && _logs.isNotEmpty) ...[
                const SizedBox(height: 20),
                Container(
                  height: 100,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: ListView.builder(
                    itemCount: _logs.length,
                    itemBuilder: (context, index) {
                      return Text(
                        _logs[index],
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.grey,
                        ),
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPoolCard(Pool pool) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF16213E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF0EA5E9).withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
                     onTap: () async {
             // Sauvegarder la piscine sélectionnée
             await _storageService.saveSelectedPool(pool);
             
             // Naviguer vers le dashboard
             if (mounted) {
               Navigator.of(context).push(
                 MaterialPageRoute(
                   builder: (context) => PoolDashboardScreen(pool: pool),
                 ),
               );
             }
           },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0EA5E9).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.pool,
                    color: Color(0xFF0EA5E9),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pool.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${pool.ipAddress}:${pool.port}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            pool.status,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.grey,
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
