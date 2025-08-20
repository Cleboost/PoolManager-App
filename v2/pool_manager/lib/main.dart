import 'package:flutter/material.dart';
import 'screens/pool_search_screen.dart';
import 'screens/pool_dashboard_screen.dart';
import 'services/pool_storage_service.dart';

void main() {
  runApp(const PoolManagerApp());
}

class PoolManagerApp extends StatelessWidget {
  const PoolManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pool Manager',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0EA5E9),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF1A1A2E),
      ),
      home: const PoolManagerHomeScreen(),
    );
  }
}

class PoolManagerHomeScreen extends StatefulWidget {
  const PoolManagerHomeScreen({super.key});

  @override
  State<PoolManagerHomeScreen> createState() => _PoolManagerHomeScreenState();
}

class _PoolManagerHomeScreenState extends State<PoolManagerHomeScreen> {
  final PoolStorageService _storageService = PoolStorageService();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkSavedPool();
  }

  Future<void> _checkSavedPool() async {
    try {
      final savedPool = await _storageService.getSelectedPool();
      if (mounted) {
        if (savedPool != null) {
          // Naviguer vers le dashboard si une piscine est sauvegardée
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => PoolDashboardScreen(pool: savedPool),
            ),
          );
        } else {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF1A1A2E),
        body: Center(
          child: CircularProgressIndicator(
            color: Color(0xFF0EA5E9),
          ),
        ),
      );
    }

    return const PoolSearchScreen();
  }
}
